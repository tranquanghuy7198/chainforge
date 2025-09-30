import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import { useState } from "react";
import {
  SuiMoveNormalizedFunction,
  SuiMoveNormalizedModule,
} from "@mysten/sui/client";
import { Button, Form, Input } from "antd";
import CollapseForm from "@components/abi-form/collapse-form";
import TransactionResult from "@components/abi-form/tx-response";
import "@/styles.scss";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { capitalize } from "@utils/utils";
import {
  funcAction,
  PARAM,
  paramName,
  TX_CONTEXT,
  TxRawData,
  TYPE_PARAM,
  typeParamName,
} from "@components/abi-form/sui-form/utils";
import ContractCallError from "@components/abi-form/contract-call-error";

const SuiForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  saveDeployedContract: (
    blockchain: Blockchain,
    address: string
  ) => Promise<void>;
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

  // const deploy = async (
  //   wallet: Wallet,
  //   blockchain: Blockchain,
  //   parsedParams: any[],
  //   payableAmount?: string
  // ) => {
  //   const txResponse = await wallet.deploy(
  //     blockchain,
  //     contractTemplate.abi,
  //     contractTemplate.bytecode,
  //     parsedParams,
  //     { payment: payableAmount } as EthereumExtra
  //   );
  //   setTxResponses({ ...txResponses, constructor: txResponse });
  //   await saveDeployedContract(blockchain, txResponse.contractAddress!);
  // };

  // const read = async (
  //   wallet: Wallet,
  //   blockchain: Blockchain,
  //   funcName: string,
  //   parsedParams: any[]
  // ) => {
  //   if (!contractAddress) {
  //     notification.error({
  //       message: "No contract selected",
  //       description: "You must select a contract first",
  //     });
  //     return;
  //   }

  //   const response = await wallet.readContract(
  //     blockchain,
  //     contractAddress.address,
  //     contractTemplate.abi,
  //     funcName,
  //     parsedParams
  //   );
  //   setTxResponses({ ...txResponses, [funcName]: response });
  // };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    funcName: string,
    rawTypeParams: string[],
    rawParams: string[]
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
      `${contractAddress.address}::${contractAddress.module}`,
      contractTemplate.abi,
      funcName,
      [rawTypeParams, rawParams],
      null
    );
    setTxResponses({ ...txResponses, [funcName]: response });
  };

  const execute = async (
    funcName: string,
    funcData: SuiMoveNormalizedFunction,
    params: TxRawData
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
    // const payableAmount = params[PAYABLE_AMOUNT];
    // const parsedParams = params[PARAM]?.map((param, paramIdx) => {
    //   const parsedParam = param.startsWith("0x")?param:JSON.parse(param)
    //   if ()
    //     tx
    // })
    // const parsedParams = func.inputs.map((param, paramIdx) => {
    //   const rawParam = params[paramKey(param, paramIdx)];
    //   if (param.type.includes("tuple") || param.type.includes("[]"))
    //     return JSON.parse(rawParam);
    //   return rawParam;
    // });

    // Pre-tx UI handling
    setLoading(true);
    const { [funcName]: _, ...newTxResponses } = txResponses;
    setTxResponses(newTxResponses);

    // Execute
    try {
      // if (action === AbiAction.Deploy)
      //   await deploy(wallet, blockchain, parsedParams, payableAmount);
      // else if (action === AbiAction.Read)
      //   await read(wallet, blockchain, funcSignature(func), parsedParams);
      // else if (action === AbiAction.Write)
      await write(
        wallet,
        blockchain,
        funcName,
        params[TYPE_PARAM] ?? [],
        params[PARAM] ?? []
      );
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
        items={Object.entries(
          (contractTemplate.abi as SuiMoveNormalizedModule).exposedFunctions
        )
          .filter(([_, funcData]) => funcAction(funcData) === action)
          .map(([funcName, funcData]) => ({
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
                  {funcData.typeParameters.map((typeParam, index) => (
                    <Form.Item
                      key={index}
                      name={[TYPE_PARAM, index]}
                      label={`Type${index}`}
                      required
                    >
                      <Input
                        placeholder={typeParamName(typeParam, index)}
                        disabled={loading}
                      />
                    </Form.Item>
                  ))}
                  {funcData.parameters
                    .filter(
                      (param) =>
                        paramName(param, funcData.typeParameters) !== TX_CONTEXT
                    )
                    .map((param, index) => (
                      <Form.Item
                        key={index}
                        name={[PARAM, index]}
                        label={`Arg${index}`}
                        required
                      >
                        <Input
                          placeholder={paramName(
                            param,
                            funcData.typeParameters
                          )}
                          disabled={loading}
                        />
                      </Form.Item>
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
                {Object.keys(txResponses).includes(funcName) && (
                  <TransactionResult
                    blockchain={blockchain}
                    wallet={wallet}
                    txResponse={txResponses[funcName]}
                  />
                )}
              </>
            ),
          }))}
      />
    </>
  );
};

export default SuiForm;
