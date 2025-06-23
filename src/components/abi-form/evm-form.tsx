import React, { useState } from "react";
import {
  AbiAction,
  Blockchain,
  CONTRACT_KEY,
  ContractTemplate,
  DeployedContract,
  EvmAbi,
  EvmAbiFunction,
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
import useLocalStorageState from "use-local-storage-state";
import { v4 } from "uuid";

const PAYABLE_AMOUNT = "payable";

const EvmForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
}> = ({ action, contractTemplate }) => {
  const [deployedContracts, setDeployedContracts] = useLocalStorageState<
    DeployedContract[]
  >(CONTRACT_KEY, { defaultValue: [] });
  const [wallet, setWallet] = useState<Wallet>();
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [txResponses, setTxResponses] = useState<Record<string, TxResponse>>(
    {}
  );

  const saveDeployedContract = (blockchain: Blockchain, address: string) => {
    setDeployedContracts(
      deployedContracts.some(
        (contract) => contract.template.id === contractTemplate.id
      )
        ? deployedContracts.map((contract) =>
            contract.template.id === contractTemplate.id
              ? {
                  ...contract,
                  addresses: [
                    ...contract.addresses,
                    {
                      blockchainId: blockchain.id,
                      address: address!,
                    },
                  ],
                }
              : contract
          )
        : [
            ...deployedContracts,
            {
              id: v4(),
              template: contractTemplate,
              addresses: [
                {
                  blockchainId: blockchain.id,
                  address: address!,
                },
              ],
            },
          ]
    );
  };

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain,
    func: EvmAbiFunction,
    params: Record<string, string>
  ) => {
    const txResponse = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      func.inputs.map((param) => {
        const rawParam = params[param.name];
        if (param.type.includes("tuple") || param.type.includes("[]"))
          return JSON.parse(rawParam);
        return rawParam;
      }),
      params[PAYABLE_AMOUNT]
    );
    setTxResponses({ ...txResponses, [func.name || func.type]: txResponse });
    saveDeployedContract(blockchain, txResponse.contractAddress!);
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
        networkClusters={contractTemplate.networkClusters}
        onWalletSelected={setWallet}
        onBlockchainSelected={setBlockchain}
      />
      <Collapse
        accordion
        items={(contractTemplate.abi as EvmAbi)
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
                    <Form.Item name={PAYABLE_AMOUNT} label="Payment" required>
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
