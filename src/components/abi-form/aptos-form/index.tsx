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
import { MoveFunction, MoveModule } from "@aptos-labs/ts-sdk";
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

  const execute = async (
    func: MoveFunction,
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
    const { [func.name]: _, ...newTxResponses } = txResps;
    setTxResponses(newTxResponses);

    // Execute
    try {
      //
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
