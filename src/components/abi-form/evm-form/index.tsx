import React from "react";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import { Space, Tag, Tooltip } from "antd";
import { Wallet } from "@utils/wallets/wallet";
import CollapseForm from "@components/abi-form/collapse-form";
import {
  evmFunctionSelector,
  funcSignature,
  getEvmAbiFunctions,
} from "@components/abi-form/evm-form/utils";
import EvmTxForm from "@components/abi-form/evm-form/evm-tx-form";
import "@/styles.scss";

const EvmForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({ action, contractTemplate, contractAddress, wallet, blockchain }) => {
  return (
    <CollapseForm
      items={getEvmAbiFunctions(contractTemplate.abi, action).map((func) => ({
        key: funcSignature(func),
        label: (
          <Space>
            <div className="function-name">{func.name || func.type}</div>
            <Tooltip title="Function Selector">
              <Tag color="green" bordered={false}>
                0x{evmFunctionSelector(func)}
              </Tag>
            </Tooltip>
          </Space>
        ),
        children: (
          <EvmTxForm
            action={action}
            contractTemplate={contractTemplate}
            contractAddress={contractAddress}
            wallet={wallet}
            blockchain={blockchain}
            evmFunction={func}
          />
        ),
      }))}
    />
  );
};

export default EvmForm;
