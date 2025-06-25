import { Form, Image, Select, Space } from "antd";
import React, { useEffect } from "react";
import {
  Blockchain,
  ContractAddress,
  NetworkCluster,
} from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";
import { Wallet } from "../../utils/wallets/wallet";
import { useForm } from "antd/es/form/Form";

const AbiWalletForm: React.FC<{
  contractAddress?: ContractAddress;
  networkClusters: NetworkCluster[];
  onWalletSelected: (wallet: Wallet) => void;
  onBlockchainSelected: (blockchain: Blockchain) => void;
}> = ({
  contractAddress,
  networkClusters,
  onWalletSelected,
  onBlockchainSelected,
}) => {
  const [form] = useForm();
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const wallets = useAppSelector((state) => state.wallet.wallets);

  useEffect(() => {
    if (contractAddress?.blockchainId)
      form.setFieldsValue({ blockchain: contractAddress.blockchainId });
  }, [contractAddress?.blockchainId, form]);

  return (
    <Form form={form} name="wallet-form" layout="horizontal">
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
          onChange={(walletKey: string) => onWalletSelected(wallets[walletKey])}
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
          onChange={(blockchainId: string) =>
            onBlockchainSelected(
              blockchains.find((chain) => chain.id === blockchainId)!
            )
          }
          disabled={contractAddress !== undefined}
        />
      </Form.Item>
    </Form>
  );
};

export default React.memo(AbiWalletForm);
