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
import { SuiMoveNormalizedModule } from "@mysten/sui/dist/cjs/client";
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
  paramName,
  TYPE_PARAM,
  typeParamName,
} from "@components/abi-form/sui-form/utils";

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

  return (
    <>
      {contextHolder}
      <CollapseForm
        items={Object.entries(
          (contractTemplate.abi as SuiMoveNormalizedModule).exposedFunctions
        ).map(([funcName, funcData]) => ({
          key: funcName,
          label: <div className="function-name">{funcName}</div>,
          children: (
            <>
              <Form
                name={funcName}
                layout="horizontal"
                autoComplete="off"
                onFinish={(values) => console.log(funcName, funcData, values)}
              >
                {funcData.typeParameters.map((typeParam, index) => (
                  <Form.Item
                    key={`Type${index}`}
                    name={[TYPE_PARAM, `Type${index}`]}
                    label={`Type${index}`}
                    required
                  >
                    <Input
                      placeholder={typeParamName(typeParam, index)}
                      disabled={loading}
                    />
                  </Form.Item>
                ))}
                {funcData.parameters.map((param, index) => (
                  <Form.Item
                    key={`Arg${index}`}
                    name={[TYPE_PARAM, `Arg${index}`]}
                    label={`Arg${index}`}
                    required
                  >
                    <Input
                      placeholder={paramName(param, funcData.typeParameters)}
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
