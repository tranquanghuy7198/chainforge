import React from "react";
import { AbiAction, EvmAbi, NetworkCluster } from "../../utils/constants";
import { Form, Input } from "antd";
import { useAppSelector } from "../../redux/hook";
import "./abi-form.scss";
import AbiWalletForm from "./abi-wallet-form";

const EvmForm: React.FC<{
  networkClusters: NetworkCluster[];
  action: AbiAction;
  abi: any;
}> = ({ networkClusters, action, abi }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const wallets = useAppSelector((state) => state.wallet.wallets);

  return (
    <div>
      <AbiWalletForm networkClusters={networkClusters} />
      <div>
        {(abi as EvmAbi)
          .filter((func) => {
            if (action === AbiAction.Deploy) return func.type === "constructor";
            if (action === AbiAction.Read)
              return func.stateMutability === "view";
            return func.type === "function" && func.stateMutability !== "view";
          })
          .map((func) => (
            <Form
              key={func.name || func.type}
              name={func.name || func.type}
              layout="horizontal"
              onFinish={(values) => {}}
            >
              {func.inputs.map((param) => (
                <Form.Item
                  key={param.name}
                  name={param.name}
                  label={param.name}
                  required
                >
                  <Input placeholder={param.type} />
                </Form.Item>
              ))}
              {func.stateMutability === "payable" && (
                <Form.Item name="payable" label="Payment" required>
                  <Input placeholder="Wei amount to pay" />
                </Form.Item>
              )}
            </Form>
          ))}
      </div>
    </div>
  );
};

export default EvmForm;
