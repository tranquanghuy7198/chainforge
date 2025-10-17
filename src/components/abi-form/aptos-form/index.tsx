import { useAuth } from "@hooks/auth";
import { useFetchMyContracts } from "@hooks/contract";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import React, { useEffect, useState } from "react";
import CollapseForm from "@components/abi-form/collapse-form";
import {
  APTOS_PARAM,
  APTOS_TYPE_PARAM,
  AptosTxRawData,
  aptosTypeParamName,
  fetchAptosModule,
  getAptosFuncs,
} from "@components/abi-form/aptos-form/utils";
import { Button, Form, Input } from "antd";
import AbiFormInput from "@components/abi-form/abi-form-input";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { capitalize } from "@utils/utils";
import TransactionResult from "@components/abi-form/tx-response";
import "./aptos-form.scss";
import {
  convertArgument,
  EntryFunctionArgumentTypes,
  MoveFunction,
  MoveModule,
  parseTypeTag,
  TypeArgument,
} from "@aptos-labs/ts-sdk";
import ContractCallError from "@components/abi-form/contract-call-error";

const AptosForm: React.FC<{
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
  const [moduleAbi, setModuleAbi] = useState<MoveModule | undefined>(
    contractTemplate.abi
  );

  useEffect(() => {
    // Each module has its own ABI, so we must fetch again before further interaction
    if (blockchain && contractAddress)
      fetchAptosModule(blockchain, contractAddress).then(setModuleAbi);
  }, [blockchain, contractAddress]);

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedTypeArgs: TypeArgument[],
    parsedArgs: EntryFunctionArgumentTypes[]
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
      `${contractAddress.address}::${contractAddress.module}`,
      null,
      funcName,
      [parsedTypeArgs, parsedArgs]
    );
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    parsedTypeArgs: TypeArgument[],
    parsedArgs: EntryFunctionArgumentTypes[]
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
      `${contractAddress.address}::${contractAddress.module}`,
      null,
      funcName,
      [parsedTypeArgs, parsedArgs],
      null
    );
  };

  const execute = async (func: MoveFunction, params: AptosTxRawData) => {
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
    const { [func.name]: _, ...newTxResponses } = txResps;
    setTxResponses(newTxResponses);

    // Execute
    try {
      // Parse function params
      const { [APTOS_TYPE_PARAM]: typeArgs, [APTOS_PARAM]: args } = params;
      const parsedTypeArgs = (typeArgs || []).map((typeArg) =>
        parseTypeTag(typeArg, { allowGenerics: true })
      );
      const parsedArgs = (args || []).map((arg, index) =>
        convertArgument(
          func.name,
          moduleAbi || contractTemplate.abi,
          arg,
          index,
          parsedTypeArgs,
          { allowUnknownStructs: true }
        )
      );

      // Call to contract
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy) return;
      else if (action === AbiAction.Read)
        response = await read(
          wallet,
          blockchain,
          func.name,
          parsedTypeArgs,
          parsedArgs
        );
      else if (action === AbiAction.Write)
        response = await write(
          wallet,
          blockchain,
          func.name,
          parsedTypeArgs,
          parsedArgs
        );
      if (response) setTxResponses({ ...txResps, [func.name]: response });
    } catch (e) {
      notification.error({
        message: "Error executing transaction",
        description: <ContractCallError error={e} />,
      });
    }

    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <CollapseForm
        items={getAptosFuncs(moduleAbi || contractTemplate.abi, action).map(
          (func) => ({
            key: func.name,
            label: <div className="function-name">{func.name}</div>,
            children: (
              <>
                <Form
                  name={func.name}
                  layout="horizontal"
                  autoComplete="off"
                  onFinish={(values) => execute(func, values)}
                >
                  {func.generic_type_params.map((typeParam, index) => (
                    <Form.Item
                      key={index}
                      name={[APTOS_TYPE_PARAM, index]}
                      label={`Type${index}`}
                      required
                    >
                      <Input
                        placeholder={aptosTypeParamName(typeParam, index)}
                        disabled={loading}
                      />
                    </Form.Item>
                  ))}
                  {func.params.map((param, index) => (
                    <AbiFormInput
                      key={index}
                      action={action}
                      wallet={wallet}
                      blockchain={blockchain}
                      contractAddress={contractAddress}
                      name={[APTOS_PARAM, index]}
                      label={`Arg${index}`}
                      required
                      placeholder={param}
                      disabled={loading}
                      json={false}
                    />
                  ))}
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
                {Object.keys(txResps).includes(func.name) && (
                  <TransactionResult
                    blockchain={blockchain}
                    wallet={wallet}
                    txResponse={txResps[func.name]}
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

export default AptosForm;
