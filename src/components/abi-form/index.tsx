import React, { useEffect, useState } from "react";
import "./abi-form.scss";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  NetworkCluster,
} from "../../utils/constants";
import EvmForm from "./evm-form";
import SuiForm from "./sui-form";
import AbiWalletForm from "./abi-wallet-form";
import { Wallet } from "../../utils/wallets/wallet";
import { useAppSelector } from "../../redux/hook";
import { Segmented } from "antd";
import SolanaForm from "./solana-form";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";

const AbiForm: React.FC<{
  defaultAction: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
}> = ({ contractAddress, defaultAction, contractTemplate }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [wallet, setWallet] = useState<Wallet>();
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [action, setAction] = useState<AbiAction>(defaultAction);

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
        />
      )}
    </div>
  );
};

export default AbiForm;
