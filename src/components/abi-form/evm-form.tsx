import React, { useState } from "react";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  EvmAbi,
  EvmAbiFunction,
  TxResponse,
} from "../../utils/constants";
import { Button, Form, Input, Space, Tag, Tooltip } from "antd";
import "./abi-form.scss";
import { Wallet } from "../../utils/wallets/wallet";
import { capitalize, evmFunctionSelector } from "../../utils/utils";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import useNotification from "antd/es/notification/useNotification";
import Paragraph from "antd/es/typography/Paragraph";
import { EthereumExtra } from "../../utils/wallets/ethereum/utils";
import CollapseForm from "./collapse-form";
import TransactionResult from "./tx-response";

const PAYABLE_AMOUNT = "payable";

const EvmForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  saveDeployedContract: (blockchain: Blockchain, address: string) => void;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({
  action,
  contractTemplate,
  saveDeployedContract,
  contractAddress,
  wallet,
  blockchain,
}) => {
  const [notification, contextHolder] = useNotification();
  const [txResponses, setTxResponses] = useState<Record<string, TxResponse>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain,
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
    const txResponse = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      func.inputs.map((param) => {
        const rawParam = params[param.name];
        if (param.type.includes("tuple") || param.type.includes("[]"))
          return JSON.parse(rawParam);
        return rawParam;
      }),
      { payment: params[PAYABLE_AMOUNT] } as EthereumExtra
    );
    setTxResponses({ ...txResponses, [func.name || func.type]: txResponse });
    saveDeployedContract(blockchain, txResponse.contractAddress!);
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    const response = await wallet.readContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      func.name!,
      func.inputs.map((param) => {
        const rawParam = params[param.name];
        try {
          return JSON.parse(rawParam);
        } catch {
          return rawParam;
        }
      })
    );
    setTxResponses({ ...txResponses, [func.name!]: response });
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    const response = await wallet.writeContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      func.name!,
      func.inputs.map((param) => {
        const rawParam = params[param.name];
        try {
          return JSON.parse(rawParam);
        } catch {
          return rawParam;
        }
      }),
      { payment: params[PAYABLE_AMOUNT] } as EthereumExtra
    );
    setTxResponses({ ...txResponses, [func.name!]: response });
  };

  const execute = async (
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
    // Check for necessary information
    if (!wallet) {
      notification.error({
        message: "No wallet selected",
        description: "You must select a wallet first",
      });
      return;
    }
    if (!blockchain) {
      notification.error({
        message: "No blockchain selected",
        description: "You must select a blockchain first",
      });
      return;
    }

    // Pre-tx UI handling
    setLoading(true);
    const { [func.name || func.type]: _, ...newTxResponses } = txResponses;
    setTxResponses(newTxResponses);

    // Execute
    try {
      if (action === AbiAction.Deploy)
        await deploy(wallet, blockchain, func, params);
      else if (action === AbiAction.Read)
        await read(wallet, blockchain, func, params);
      else if (action === AbiAction.Write)
        await write(wallet, blockchain, func, params);
    } catch (e) {
      notification.error({
        message: "Execution Failed",
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {e instanceof Error ? e.message : String(e)}
          </Paragraph>
        ),
      });
    }

    // Post-tx UI handling
    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <CollapseForm
        items={(contractTemplate.abi as EvmAbi)
          .filter((func) => {
            if (action === AbiAction.Deploy) return func.type === "constructor";
            if (action === AbiAction.Read)
              return func.stateMutability === "view";
            return func.type === "function" && func.stateMutability !== "view";
          })
          .map((func) => ({
            key: func.name || func.type,
            label: (
              <Space>
                <div className="function-name">{func.name || func.type}</div>
                <Tooltip title="Function Selector">
                  <Tag color="#108ee9">0x{evmFunctionSelector(func)}</Tag>
                </Tooltip>
              </Space>
            ),
            children: (
              <>
                <Form
                  name={func.name || func.type}
                  layout="horizontal"
                  onFinish={(values) => execute(func, values)}
                >
                  {func.inputs.map((param) => (
                    <Form.Item
                      key={param.name}
                      name={param.name}
                      label={param.name}
                      required
                    >
                      <Input placeholder={param.type} disabled={loading} />
                    </Form.Item>
                  ))}
                  {func.stateMutability === "payable" && (
                    <Form.Item name={PAYABLE_AMOUNT} label="Payment" required>
                      <Input
                        placeholder="Wei amount to pay"
                        disabled={loading}
                      />
                    </Form.Item>
                  )}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={
                        action === AbiAction.Deploy ? (
                          <CloudUploadOutlined />
                        ) : action === AbiAction.Read ? (
                          <EyeOutlined />
                        ) : (
                          <EditOutlined />
                        )
                      }
                    >
                      {capitalize(action.toString())}
                    </Button>
                  </Form.Item>
                </Form>
                {Object.keys(txResponses).includes(func.name || func.type) && (
                  <TransactionResult
                    blockchain={blockchain}
                    txResponse={txResponses[func.name || func.type]}
                  />
                )}
              </>
            ),
          }))}
      />
    </>
  );
};

export default EvmForm;
