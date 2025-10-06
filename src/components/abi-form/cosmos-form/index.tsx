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
                  onFinish={console.log}
                >
                  {funcData.required?.map((paramName) => (
                    <Form.Item
                      key={paramName}
                      name={paramName}
                      label={paramName}
                      required
                    >
                      <Input
                        placeholder={cwParamType(
                          funcData.properties![paramName]
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
