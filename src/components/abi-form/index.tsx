import React, { useEffect, useState } from "react";
import "@components/abi-form/abi-form.scss";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  NetworkCluster,
} from "@utils/constants";
import EvmForm from "@components/abi-form/evm-form";
import SuiForm from "@components/abi-form/sui-form";
import AbiWalletForm from "@components/abi-form/abi-wallet-form";
import { Wallet } from "@utils/wallets/wallet";
import { Button, Flex, Segmented } from "antd";
import SolanaForm from "@components/abi-form/solana-form";
import { EditOutlined, EyeOutlined, SendOutlined } from "@ant-design/icons";
import { useFetchBlockchains } from "@hooks/blockchain";
import { useAuth } from "@hooks/auth";
import { addContractAddress } from "@api/contracts";
import { useFetchMyContracts } from "@hooks/contract";
import ShareModal from "@components/share-modal";
import { buildShareableUrl } from "@utils/share";
import useNotification from "antd/es/notification/useNotification";

const AbiForm: React.FC<{
  defaultAction: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress; // not used for Contract Deploy
}> = ({ contractAddress, defaultAction, contractTemplate }) => {
  const { blockchains } = useFetchBlockchains();
  const { callAuthenticatedApi } = useAuth();
  const { fetchContracts } = useFetchMyContracts();
  const [wallet, setWallet] = useState<Wallet>();
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [action, setAction] = useState<AbiAction>(defaultAction);
  const [share, setShare] = useState<boolean>(false);
  const [notification, contextHolder] = useNotification();
  const [sharing, setSharing] = useState<boolean>(false);

  const saveDeployedContract = async (
    blockchain: Blockchain,
    address: string
  ) => {
    await callAuthenticatedApi(
      addContractAddress,
      contractTemplate.id,
      blockchain.id,
      address,
      false // Default as private after deploying
    );
    await fetchContracts(true);
  };

  useEffect(() => {
    const selectedChain = blockchains.find(
      (chain) => chain.id === contractAddress?.blockchainId
    );
    if (selectedChain) setBlockchain(selectedChain);
  }, [contractAddress, blockchains]);

  const shareContract = async () => {
    try {
      setSharing(true);
      if (!blockchain || !contractAddress)
        throw new Error("Blockchain or contract address not found");
      if (!contractAddress.publicity) {
        await callAuthenticatedApi(
          addContractAddress,
          contractTemplate.id,
          blockchain.id,
          contractAddress.address,
          true // Must publish before sharing so others can access it
        );
        await fetchContracts(true);
      }
      setShare(true);
    } catch (error) {
      notification.error({
        message: "Cannot share contract",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <AbiWalletForm
        contractAddress={contractAddress}
        networkClusters={contractTemplate.networkClusters}
        onWalletSelected={setWallet}
        onBlockchainSelected={setBlockchain}
      />
      {defaultAction !== AbiAction.Deploy && (
        <Flex
          align="center"
          justify="space-between"
          className="action-selector"
        >
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
          />
          <Button
            type="link"
            variant="filled"
            color="primary"
            icon={<SendOutlined />}
            iconPosition="end"
            loading={sharing}
            onClick={shareContract}
          >
            Share
          </Button>
        </Flex>
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
      <ShareModal
        shareableUrl={buildShareableUrl(
          `${window.location.origin}/#/popular-contracts`,
          contractTemplate.id,
          contractAddress?.blockchainId ?? "",
          contractAddress?.address ?? ""
        )}
        showModal={share}
        onHide={() => setShare(false)}
      />
    </div>
  );
};

export default AbiForm;
