import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import { useEffect, useState } from "react";
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
  fetchSuiAbi,
  funcAction,
  getFullSuiTransactions,
  PARAM,
  paramName,
  TX_CONTEXT,
  TxRawData,
  TYPE_PARAM,
  typeParamName,
} from "@components/abi-form/sui-form/utils";
import ContractCallError from "@components/abi-form/contract-call-error";
import { useAuth } from "@hooks/auth";
import { useFetchMyContracts, useFetchMyTemplates } from "@hooks/contract";
import { addContractAddresses, updateTemplate } from "@api/contracts";
import { SuiMoveNormalizedModules } from "@mysten/sui/client";

const SuiForm: React.FC<{
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
  const { fetchTemplates } = useFetchMyTemplates();
  const [packageAbi, setPackageAbi] = useState<SuiMoveNormalizedModules>(
    contractTemplate.abi
  );

  useEffect(() => {
    if (blockchain && contractAddress)
      fetchSuiAbi(blockchain, contractAddress.address).then(setPackageAbi);
  }, [blockchain, contractAddress]);

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain
  ): Promise<TxResponse> => {
    // Deploy
    const txResponse = await wallet.deploy(
      blockchain,
      null,
      contractTemplate.bytecode,
      null,
      null
    );

    // Fetch and save Sui ABI
    const abi = await fetchSuiAbi(
      blockchain,
      txResponse.contractAddresses![0].address
    );
    await callAuthenticatedApi(updateTemplate, { ...contractTemplate, abi });
    await fetchTemplates(true);
    setPackageAbi(abi);

    // Save deployed Sui package modules
    await callAuthenticatedApi(
      addContractAddresses,
      contractTemplate.id,
      txResponse.contractAddresses ?? []
    );
    await fetchContracts(true);

    return txResponse;
  };

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
      packageAbi,
      funcName,
      [rawTypeParams, rawParams],
      null
    );
  };

  const execute = async (funcName: string, params: TxRawData) => {
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
    const { [funcName]: _, ...newTxResponses } = txResponses;
    setTxResponses(newTxResponses);

    // Execute
    try {
      let txResponse: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        txResponse = await deploy(wallet, blockchain);
      // else if (action === AbiAction.Read)
      //   await read(wallet, blockchain, funcSignature(func), parsedParams);
      else if (action === AbiAction.Write)
        txResponse = await write(
          wallet,
          blockchain,
          funcName,
          params[TYPE_PARAM] ?? [],
          params[PARAM] ?? []
        );
      if (txResponse)
        setTxResponses({ ...txResponses, [funcName]: txResponse });
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
        items={getFullSuiTransactions(packageAbi, contractAddress)
          .filter((func) => funcAction(func) === action)
          .map(([funcName, funcData]) => ({
            key: funcName,
            label: <div className="function-name">{funcName}</div>,
            children: (
              <>
                <Form
                  name={funcName}
                  layout="horizontal"
                  autoComplete="off"
                  onFinish={(values) => execute(funcName, values)}
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
