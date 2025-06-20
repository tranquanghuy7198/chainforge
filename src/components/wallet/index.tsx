import React from "react";
import { Wallet } from "../../utils/wallets/wallet";
import { Card, Image } from "antd";
import "./wallet.scss";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { Blockchain } from "../../utils/constants";

const WalletCard: React.FC<{
  wallet: Wallet;
  onWalletUpdate: (wallet: Wallet) => void;
  blockchains: Blockchain[];
}> = ({ wallet, onWalletUpdate, blockchains }) => {
  return (
    <Card
      hoverable
      className="wallet-card"
      style={{ backgroundColor: wallet.ui.backgroundColor }}
      onClick={() => {
        wallet.connect();
        onWalletUpdate(wallet);
      }}
    >
      <div className="wallet-card-content">
        <Image className="wallet-logo" preview={false} src={wallet.ui.icon} />
        <div>
          <div className="wallet-title">
            <div
              className="wallet-name"
              style={{ color: wallet.ui.titleColor }}
            >
              {wallet.ui.name}
            </div>
            <div
              className="wallet-info-container"
              style={{ color: wallet.address ? "green" : "red" }}
            >
              {wallet.address && <CheckCircleOutlined color="green" />}
              {!wallet.address && <PauseCircleOutlined color="red" />}
              <div className="wallet-info">
                {wallet.address
                  ? `${wallet.address?.slice(0, 10)}...${wallet.address?.slice(
                      -8
                    )}`
                  : "Not Connected"}
              </div>
            </div>
            {wallet.chainId && (
              <div className="wallet-info-container">
                <AppstoreOutlined />
                <div className="wallet-info">
                  {blockchains.find(
                    (blockchain) => blockchain.chainId === wallet.chainId
                  )?.name || `Unknown network (${wallet.chainId})`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WalletCard;
