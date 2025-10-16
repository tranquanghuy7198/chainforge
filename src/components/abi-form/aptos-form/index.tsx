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
import React, { useState } from "react";
import CollapseForm from "@components/abi-form/collapse-form";
import {
  APTOS_PARAM,
  APTOS_TYPE_PARAM,
  aptosTypeParamName,
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

  return (
    <>
      {contextHolder}
      <CollapseForm
        items={getAptosFuncs(contractTemplate.abi, action).map((func) => ({
          key: func.name,
          label: <div className="function-name">{func.name}</div>,
          children: (
            <>
              <Form
                name={func.name}
                layout="horizontal"
                autoComplete="off"
                onFinish={console.log}
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
        }))}
      />
    </>
  );
};

export default AptosForm;
