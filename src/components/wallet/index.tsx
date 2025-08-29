import React from "react";
import { Wallet } from "@utils/wallets/wallet";
import { Card, Image, Tooltip } from "antd";
import "./wallet.scss";
import { CheckCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { useAppSelector } from "@redux/hook";
import { shorten } from "@utils/utils";
import useNotification from "antd/es/notification/useNotification";
import Paragraph from "antd/es/typography/Paragraph";

const WalletCard: React.FC<{
  wallet: Wallet;
  onWalletUpdate: (wallet: Wallet) => void;
}> = ({ wallet, onWalletUpdate }) => {
  const [notification, contextHolder] = useNotification();
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);

  const connectWallet = async (wallet: Wallet): Promise<void> => {
    try {
      await wallet.connect();
      onWalletUpdate(wallet);
    } catch (error) {
      notification.error({
        message: `Cannot connect ${wallet.ui.name}`,
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {error instanceof Error ? error.message : String(error)}
          </Paragraph>
        ),
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        hoverable
        className="wallet-card"
        size="small"
        variant="borderless"
        style={{ backgroundColor: wallet.ui.backgroundColor }}
        onClick={() => connectWallet(wallet)}
      >
        <div className="wallet-card-content">
          <Image className="wallet-logo" preview={false} src={wallet.ui.icon} />
          <div className="wallet-title">
            <div
              className="wallet-name"
              style={{ color: wallet.ui.titleColor }}
            >
              {wallet.ui.name}
            </div>
            <div
              className="wallet-info-container"
              style={{ color: wallet.address ? "#237804" : "#f5222d" }}
            >
              {wallet.address && wallet.chainId && (
                <Tooltip
                  title={
                    blockchains.find(
                      (blockchain) =>
                        blockchain.chainId === wallet.chainId &&
                        blockchain.networkCluster === wallet.networkCluster
                    )?.name || `Unknown network (${wallet.chainId})`
                  }
                >
                  <Image
                    src={
                      blockchains.find(
                        (blockchain) =>
                          blockchain.chainId === wallet.chainId &&
                          blockchain.networkCluster === wallet.networkCluster
                      )?.logo
                    }
                    preview={false}
                    className="wallet-chain-logo"
                  />
                </Tooltip>
              )}
              {wallet.address && !wallet.chainId && <CheckCircleOutlined />}
              {!wallet.address && <PauseCircleOutlined />}
              <div className="wallet-info">
                {wallet.address ? shorten(wallet.address) : "Not Connected"}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default WalletCard;
