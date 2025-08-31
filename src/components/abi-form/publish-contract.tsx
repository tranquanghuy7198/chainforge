import { Wallet } from "@utils/wallets/wallet";
import { ContractAddress, ContractTemplate } from "@utils/constants";
import React from "react";
import { useAuth } from "@hooks/auth";
import useNotification from "antd/es/notification/useNotification";
import { useAppSelector } from "@redux/hook";
import { Button } from "antd";

const PublishContract: React.FC<{
  contractId?: string;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
}> = ({ contractId, contractTemplate, contractAddress, wallet }) => {
  const { session, login } = useAuth();
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [notification, contextHolder] = useNotification();

  const loginWithWallet = async () => {
    try {
      await login(
        wallet,
        blockchains.find((b) => b.id === contractAddress?.blockchainId)
      );
    } catch (error) {
      notification.error({
        message: "Publish failed",
        description:
          error instanceof Error
            ? error.message
            : `Failed to publish ${contractTemplate.name}`,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Button onClick={loginWithWallet}>Publish</Button>
    </>
  );
};

export default PublishContract;
