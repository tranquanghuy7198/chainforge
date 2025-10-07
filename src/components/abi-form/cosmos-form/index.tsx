import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import React, { useState } from "react";
import CollapseForm from "@components/abi-form/collapse-form";
import {
  getCowmWasmFuncs,
  cwParamType,
  CosmWasmJSONSchema,
  parseCosmosArguments,
} from "@components/abi-form/cosmos-form/utils";
import "@/styles.scss";
import TransactionResult from "@components/abi-form/tx-response";
import { Button, Form, Input } from "antd";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { capitalize } from "@utils/utils";
import ContractCallError from "@components/abi-form/contract-call-error";
import { CosmosExtra } from "@utils/wallets/cosmos/utils";
import { useAuth } from "@hooks/auth";
import { addContractAddresses } from "@api/contracts";
import { useFetchMyContracts } from "@hooks/contract";

const FUNDS = "use"; // Rust keyword

const CosmosForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({ action, contractTemplate, contractAddress, wallet, blockchain }) => {
  const [notification, contextHolder] = useNotification();
  const [txResps, setTxResponses] = useState<Record<string, TxResponse>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { callAuthenticatedApi } = useAuth();
  const { fetchContracts } = useFetchMyContracts();

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain,
    parsedParams: any,
    funds?: string
  ): Promise<TxResponse> => {
    // Deploy
    const txResponse = await wallet.deploy(
      blockchain,
      null,
      contractTemplate.bytecode,
      parsedParams,
      {
        payment: funds,
        contractName: contractTemplate.name,
      } as CosmosExtra
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
    parsedParams: any
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
      null,
      funcName,
      parsedParams
    );
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedParams: any,
    funds?: string
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
      null,
      funcName,
      parsedParams,
      { payment: funds } as CosmosExtra
    );
  };

  const execute = async (
    funcName: string,
    funcData: CosmWasmJSONSchema,
    params: Record<string, string | undefined>
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
    const parsedParams = parseCosmosArguments(funcData, params);
    const funds = params[FUNDS];

    // Pre-tx UI handling
    setLoading(true);
    const { [funcName]: _, ...newTxResponses } = txResps;
    setTxResponses(newTxResponses);

    // Execute
    try {
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        response = await deploy(wallet, blockchain, parsedParams, funds);
      else if (action === AbiAction.Read)
        response = await read(wallet, blockchain, funcName, parsedParams);
      else if (action === AbiAction.Write)
        response = await write(
          wallet,
          blockchain,
          funcName,
          parsedParams,
          funds
        );
      if (response) setTxResponses({ ...txResps, [funcName]: response });
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
        items={getCowmWasmFuncs(contractTemplate.abi, action).map(
          ([funcName, funcData]) => ({
            key: funcName,
            label: <div className="function-name">{funcName}</div>,
            children: (
              <>
                <Form
                  name={funcName}
                  layout="horizontal"
                  autoComplete="off"
                  onFinish={(values) => execute(funcName, funcData, values)}
                >
                  {Object.keys(funcData.properties || {}).map((paramName) => {
                    const [paramType, required] = cwParamType(
                      (funcData.properties || {})[paramName]
                    );
                    return (
                      <Form.Item
                        key={paramName}
                        name={paramName}
                        label={paramName}
                        required={required}
                      >
                        <Input placeholder={paramType} disabled={loading} />
                      </Form.Item>
                    );
                  })}
                  <Form.Item name={FUNDS} label="Funds">
                    <Input
                      placeholder={`${blockchain?.nativeDenom} amount to pay`}
                      disabled={loading}
                    />
                  </Form.Item>
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
                {Object.keys(txResps).includes(funcName) && (
                  <TransactionResult
                    blockchain={blockchain}
                    wallet={wallet}
                    txResponse={txResps[funcName]}
                  />
                )}
              </>
            ),
          })
        )}
      />
    </>
  );
};

export default CosmosForm;
