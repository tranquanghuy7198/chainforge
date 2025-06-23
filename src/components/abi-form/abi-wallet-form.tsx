import { Form, Image, Select, Space } from "antd";
import React from "react";
import { NetworkCluster } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";

const AbiWalletForm: React.FC<{ networkClusters: NetworkCluster[] }> = ({
  networkClusters,
}) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const wallets = useAppSelector((state) => state.wallet.wallets);

  return (
    <Form name="wallet-form" layout="horizontal" onFinish={(values) => {}}>
      <Form.Item name="wallet" label="Wallet" required>
        <Select
          options={Object.values(wallets)
            .filter((wallet) => networkClusters.includes(wallet.networkCluster))
            .map((wallet) => ({
              label: wallet.constructor.name,
              value: wallet.key,
              emoji: wallet.ui.icon,
            }))}
          optionRender={(option) => (
            <Space align="center">
              <Image
                src={option.data.emoji}
                className="select-icon"
                preview={false}
              />
              <div>{option.data.label}</div>
            </Space>
          )}
        />
      </Form.Item>
      <Form.Item name="blockchain" label="Blockchain" required>
        <Select
          options={blockchains
            .filter((chain) => networkClusters.includes(chain.networkCluster))
            .map((chain) => ({
              label: chain.name,
              value: chain.id,
              emoji: chain.logo,
            }))}
          optionRender={(option) => (
            <Space align="center">
              <Image
                src={option.data.emoji}
                className="select-icon"
                preview={false}
              />
              <div>{option.data.label}</div>
            </Space>
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default AbiWalletForm;
