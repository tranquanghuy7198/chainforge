import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  EditOutlined,
  ExportOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Card, Image, Tooltip } from "antd";
import "./blockchain-card.scss";
import React from "react";
import { Blockchain } from "../../utils/constants";

const BlockchainCard: React.FC<{ blockchain: Blockchain }> = ({
  blockchain,
}) => {
  return (
    <Card
      hoverable
      className="blockchain-card"
      actions={[
        <SettingOutlined />,
        <Tooltip title="Edit" arrow={false}>
          <EditOutlined />
        </Tooltip>,
        <Tooltip title="Go to Explorer" arrow={false}>
          <a
            href={blockchain.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="blockchain-explorer"
          >
            <ExportOutlined />
          </a>
        </Tooltip>,
      ]}
    >
      <div className="blockchain-card-content">
        <Image
          className="blockchain-logo"
          src={blockchain.logo}
          preview={false}
        />
        <div>
          <div className="blockchain-title">
            <div className="blockchain-name">{blockchain.name}</div>
            {!blockchain.isTestnet && (
              <Tooltip
                overlay={
                  <div>
                    Mainnet <CheckCircleOutlined />
                  </div>
                }
                arrow={false}
                color="green"
              >
                <CheckCircleTwoTone
                  twoToneColor="#52c41a"
                  className="blockchain-mainnet"
                />
              </Tooltip>
            )}
          </div>
          <div>Chain ID: {blockchain.chainId}</div>
          <div>Token: {blockchain.nativeToken}</div>
          <div>Decimals: {blockchain.nativeDecimal}</div>
        </div>
      </div>
    </Card>
  );
};

export default BlockchainCard;
