import React, { useState } from "react";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "@utils/constants";
import { Button, Form, Input, Space, Tag, Tooltip } from "antd";
import { Wallet } from "@utils/wallets/wallet";
import { capitalize } from "@utils/utils";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import useNotification from "antd/es/notification/useNotification";
import { EthereumExtra } from "@utils/wallets/ethereum/utils";
import CollapseForm from "@components/abi-form/collapse-form";
import TransactionResult from "@components/abi-form/tx-response";
import "@/styles.scss";
import {
  EvmAbi,
  EvmAbiFunction,
  evmFunctionSelector,
  funcSignature,
  paramKey,
} from "@components/abi-form/evm-form/utils";
import ContractCallError from "@components/abi-form/contract-call-error";
import { useAuth } from "@hooks/auth";
import { useFetchMyContracts } from "@hooks/contract";
import { addContractAddresses } from "@api/contracts";
import AbiFormInput from "@components/abi-form/abi-form-input";

const PAYABLE_AMOUNT = "payable";

const EvmForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({ action, contractTemplate, contractAddress, wallet, blockchain }) => {
  const [notification, contextHolder] = useNotification();
  const [txResponses, setTxResponses] = useState<Record<string, TxResponse>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const { callAuthenticatedApi } = useAuth();
  const { fetchContracts } = useFetchMyContracts();

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain,
    parsedParams: any[],
    payableAmount?: string
  ): Promise<TxResponse> => {
    // Deploy
    const txResponse = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      parsedParams,
      { payment: payableAmount } as EthereumExtra
    );

    // Save deployed Etherem contract
    await callAuthenticatedApi(
      addContractAddresses,
      contractTemplate.id,
      txResponse.contractAddresses || []
    );
    await fetchContracts(true);

    return txResponse;
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedParams: any[]
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    return await wallet.readContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      funcName,
      parsedParams
    );
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedParams: any[],
    payableAmount?: string
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }

    return await wallet.writeContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      funcName,
      parsedParams,
      { payment: payableAmount } as EthereumExtra
    );
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

    // Parse function params
    const payableAmount = params[PAYABLE_AMOUNT];
    const parsedParams = func.inputs.map((param, paramIdx) => {
      const rawParam = params[paramKey(param, paramIdx)];
      if (param.type.includes("tuple") || param.type.includes("[]"))
        return JSON.parse(rawParam);
      return rawParam;
    });

    // Pre-tx UI handling
    setLoading(true);
    const { [funcSignature(func)]: _, ...newTxResponses } = txResponses;
    setTxResponses(newTxResponses);

    // Execute
    try {
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        response = await deploy(
          wallet,
          blockchain,
          parsedParams,
          payableAmount
        );
      else if (action === AbiAction.Read)
        response = await read(
          wallet,
          blockchain,
          funcSignature(func),
          parsedParams
        );
      else if (action === AbiAction.Write)
        response = await write(
          wallet,
          blockchain,
          funcSignature(func),
          parsedParams,
          payableAmount
        );
      if (response)
        setTxResponses({ ...txResponses, [funcSignature(func)]: response });
    } catch (e) {
      notification.error({
        message: "Execution Failed",
        description: <ContractCallError error={e} />,
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
              return (
                func.type === "function" && func.stateMutability === "view"
              );
            if (action === AbiAction.Write)
              return (
                func.type === "function" && func.stateMutability !== "view"
              );
            return false;
          })
          .map((func) => ({
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
              <>
                <Form
                  name={funcSignature(func)}
                  layout="horizontal"
                  autoComplete="off"
                  onFinish={(values) => execute(func, values)}
                >
                  {func.inputs.map((param, paramIdx) => (
                    <AbiFormInput
                      key={paramKey(param, paramIdx)}
                      wallet={wallet}
                      blockchain={blockchain}
                      contractAddress={contractAddress}
                      name={paramKey(param, paramIdx)}
                      label={param.name}
                      required
                      placeholder={param.type}
                      disabled={loading}
                      json={
                        param.type.includes("tuple") ||
                        param.type.includes("[]")
                      }
                    />
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
                {Object.keys(txResponses).includes(funcSignature(func)) && (
                  <TransactionResult
                    blockchain={blockchain}
                    wallet={wallet}
                    txResponse={txResponses[funcSignature(func)]}
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
