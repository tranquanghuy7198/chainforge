import React, { useState } from "react";
import {
  AbiAction,
  Blockchain,
  EvmAbi,
  EvmAbiFunction,
  NetworkCluster,
  TxResponse,
} from "../../utils/constants";
import {
  Button,
  Collapse,
  Descriptions,
  Form,
  Input,
  notification,
} from "antd";
import "./abi-form.scss";
import AbiWalletForm from "./abi-wallet-form";
import { Wallet } from "../../utils/wallets/wallet";
import { capitalize } from "../../utils/utils";

const EvmForm: React.FC<{
  networkClusters: NetworkCluster[];
  action: AbiAction;
  abi: any;
  bytecode: string;
}> = ({ networkClusters, action, abi, bytecode }) => {
  const [wallet, setWallet] = useState<Wallet>();
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [txResponses, setTxResponses] = useState<Record<string, TxResponse>>(
    {}
  );

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain,
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
    const txResponse = await wallet.deploy(
      blockchain,
      abi,
      bytecode,
      func.inputs.map((param) => {
        const rawParam = params[param.name];
        if (param.type.includes("tuple") || param.type.includes("[]"))
          return JSON.parse(rawParam);
        return rawParam;
      })
    );
    setTxResponses({ ...txResponses, [func.name || func.type]: txResponse });
  };

  const read = async () => {};

  const write = async () => {};

  const execute = async (
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
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
    if (action === AbiAction.Deploy)
      await deploy(wallet, blockchain, func, params);
    if (action === AbiAction.Read) await read();
    if (action === AbiAction.Write) await write();
  };

  return (
    <div>
      <AbiWalletForm
        networkClusters={networkClusters}
        onWalletSelected={setWallet}
        onBlockchainSelected={setBlockchain}
      />
      <Collapse
        accordion
        items={(abi as EvmAbi)
          .filter((func) => {
            if (action === AbiAction.Deploy) return func.type === "constructor";
            if (action === AbiAction.Read)
              return func.stateMutability === "view";
            return func.type === "function" && func.stateMutability !== "view";
          })
          .map((func) => ({
            key: func.name || func.type,
            label: func.name || func.type,
            children: (
              <>
                <Form
                  name={func.name || func.type}
                  layout="horizontal"
                  onFinish={(values) => execute(func, values)}
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
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Execute
                    </Button>
                  </Form.Item>
                </Form>
                {Object.keys(txResponses).includes(func.name || func.type) && (
                  <Descriptions
                    bordered
                    size="small"
                    items={Object.entries(
                      txResponses[func.name || func.type]
                    ).map(([key, value]) => ({
                      key,
                      label: capitalize(key),
                      children: value,
                    }))}
                  />
                )}
              </>
            ),
          }))}
      />
    </div>
  );
};

export default EvmForm;
