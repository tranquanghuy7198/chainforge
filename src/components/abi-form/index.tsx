import React, { useEffect, useState } from "react";
import "@components/abi-form/abi-form.scss";
import {
  AbiAction,
  Blockchain,
  CONTRACT_KEY,
  ContractAddress,
  ContractTemplate,
  DeployedContract,
  NetworkCluster,
} from "@utils/constants";
import EvmForm from "@components/abi-form/evm-form";
import SuiForm from "@components/abi-form/sui-form";
import AbiWalletForm from "@components/abi-form/abi-wallet-form";
import { Wallet } from "@utils/wallets/wallet";
import { useAppSelector } from "@redux/hook";
import { Flex, Segmented } from "antd";
import SolanaForm from "@components/abi-form/solana-form";
import { EditOutlined, EyeOutlined, StarOutlined } from "@ant-design/icons";
import useLocalStorageState from "use-local-storage-state";
import { v4 } from "uuid";
import PublishContract from "@components/abi-form/publish-contract";
import { useFetchBlockchains } from "@hooks/blockchain";

const AbiForm: React.FC<{
  defaultAction: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress; // not used for Contract Deploy
  contractId?: string; // not used for Contract Deploy
}> = ({ contractAddress, defaultAction, contractTemplate, contractId }) => {
  const { blockchains } = useFetchBlockchains();
  const [wallet, setWallet] = useState<Wallet>();
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [action, setAction] = useState<AbiAction>(defaultAction);
  const [deployedContracts, setDeployedContracts] = useLocalStorageState<
    DeployedContract[]
  >(CONTRACT_KEY, { defaultValue: [] });

  const saveDeployedContract = (blockchain: Blockchain, address: string) => {
    // TODO: Save contract with given template
    // setDeployedContracts(
    //   deployedContracts.some(
    //     (contract) => contract.template.id === contractTemplate.id
    //   )
    //     ? deployedContracts.map((contract) =>
    //         contract.template.id === contractTemplate.id
    //           ? {
    //               ...contract,
    //               addresses: [
    //                 ...contract.addresses,
    //                 {
    //                   blockchainId: blockchain.id,
    //                   address: address!,
    //                 },
    //               ],
    //             }
    //           : contract
    //       )
    //     : [
    //         ...deployedContracts,
    //         {
    //           id: v4(),
    //           template: contractTemplate,
    //           addresses: [
    //             {
    //               blockchainId: blockchain.id,
    //               address: address!,
    //             },
    //           ],
    //         },
    //       ]
    // );
  };

  useEffect(() => {
    const selectedChain = blockchains.find(
      (chain) => chain.id === contractAddress?.blockchainId
    );
    if (selectedChain) setBlockchain(selectedChain);
  }, [contractAddress, blockchains]);

  return (
    <div>
      <AbiWalletForm
        contractAddress={contractAddress}
        networkClusters={contractTemplate.networkClusters}
        onWalletSelected={setWallet}
        onBlockchainSelected={setBlockchain}
      />
      {defaultAction !== AbiAction.Deploy && (
        <Segmented<AbiAction>
          defaultValue={defaultAction}
          options={[
            {
              label: "Read Contract",
              value: AbiAction.Read,
              icon: <EyeOutlined />,
            },
            {
              label: "Write Contract",
              value: AbiAction.Write,
              icon: <EditOutlined />,
            },
          ]}
          onChange={(value) => setAction(value)}
          className="action-selector"
        />
      )}
      {contractTemplate.networkClusters.includes(NetworkCluster.Sui) ? (
        <SuiForm action={action} abi={contractTemplate.abi} />
      ) : contractTemplate.networkClusters.includes(NetworkCluster.Solana) ? (
        <SolanaForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
          saveDeployedContract={saveDeployedContract}
        />
      ) : contractTemplate.networkClusters.includes(NetworkCluster.Cosmos) ? (
        <>Available soon</>
      ) : contractTemplate.networkClusters.includes(
          NetworkCluster.FlowChain
        ) ? (
        <>Available soon</>
      ) : (
        <EvmForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
          saveDeployedContract={saveDeployedContract}
        />
      )}
    </div>
  );
};

export default AbiForm;
