import useNotification from "antd/es/notification/useNotification";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "../../utils/constants";
import { Wallet } from "../../utils/wallets/wallet";
import { Button, Descriptions, Form, Input, Select } from "antd";
import { Fragment, useState } from "react";
import { capitalize } from "../../utils/utils";
import {
  ACCOUNT_PARAM,
  ARG_PARAM,
  DEPLOYMENT_INSTRUCTION,
  getFullInstructions,
  Idl,
  IdlInstruction,
  SolanaIdlParser,
  stringifyArgType,
} from "../../utils/types/solana";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import { PublicKey } from "@solana/web3.js";
import { SolanaExtra } from "../../utils/wallets/solana/utils";
import { FormInstance } from "antd/es/form/Form";
import CollapseForm from "./collapse-form";

enum AccountOption {
  Custom = "custom-account",
  Wallet = "wallet-account",
  Program = "program-account",
}

const SolanaForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  saveDeployedContract: (blockchain: Blockchain, address: string) => void;
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
  const forms: Record<string, FormInstance> = getFullInstructions(
    contractTemplate.abi as Idl
  ).reduce((acc, instruction) => {
    acc[instruction.name] = Form.useForm()[0];
    return acc;
  }, {} as Record<string, FormInstance>);
  const [notification, contextHolder] = useNotification();
  const [txResponses, setTxResponses] = useState<Record<string, TxResponse>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);

  const deploy = async (wallet: Wallet, blockchain: Blockchain) => {
    const response = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      null,
      { programKeypair: contractTemplate.programKeypair } as SolanaExtra
    );
    setTxResponses({ ...txResponses, [DEPLOYMENT_INSTRUCTION]: response });
    saveDeployedContract(blockchain, response.contractAddress!);
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
  ) => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }
    const response = await wallet.readContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      instruction.name,
      [args, accounts]
    );
    setTxResponses({ ...txResponses, [instruction.name]: response });
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
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
      contractAddress.address,
      contractTemplate.abi,
      instruction.name,
      [args, accounts],
      {} as SolanaExtra
    );

    setTxResponses({ ...txResponses, [instruction.name]: response });
  };

  const execute = async (
    instruction: IdlInstruction,
    params: Record<string, Record<string, string>>
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
    const { [instruction.name]: _, ...newTxResponses } = txResponses;
    setTxResponses(newTxResponses);

    // Execute
    try {
      // Prepare args and accounts
      const argParser = new SolanaIdlParser(contractTemplate.abi as Idl);
      const args = instruction.args.map((arg) =>
        argParser.parseValue((params[ARG_PARAM] || {})[arg.name], arg.type)
      );
      const accounts = Object.fromEntries(
        Object.entries(params[ACCOUNT_PARAM] || {}).map(([key, value]) => [
          key,
          new PublicKey(value),
        ])
      );

      // Execute in wallet
      if (action === AbiAction.Deploy) await deploy(wallet, blockchain);
      else if (action === AbiAction.Read)
        await read(wallet, blockchain, instruction, args, accounts);
      else if (action === AbiAction.Write)
        await write(wallet, blockchain, instruction, args, accounts);
    } catch (e) {
      notification.error({
        message: "Execution Failed",
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {e instanceof Error ? e.message : String(e)}
          </Paragraph>
        ),
      });
    }

    // Post-tx UI handling
    setLoading(false);
  };

  const updateFormAccount = async (
    instructionName: string,
    accountName: string,
    accountOption: AccountOption
  ) => {
    try {
      // Calculate account value
      let accountValue = undefined;
      if (accountOption === AccountOption.Wallet) {
        if (!wallet) throw new Error("You must select a wallet first");
        if (!blockchain) throw new Error("You must select a blockchain first");
        await wallet.connect(blockchain);
        accountValue = wallet.address;
      } else if (accountOption === AccountOption.Program) {
        if (!contractAddress)
          throw new Error("You must select a contract first");
        accountValue = contractAddress.address;
      }

      // Set it in the form
      forms[instructionName].setFieldValue(
        [ACCOUNT_PARAM, accountName],
        accountValue
      );
    } catch (e) {
      notification.error({
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <CollapseForm
        items={getFullInstructions(contractTemplate.abi as Idl)
          .filter((instruction) => {
            if (action === AbiAction.Deploy)
              return instruction.name === DEPLOYMENT_INSTRUCTION;
            let isWriteInstruction = false;
            for (const account of instruction.accounts)
              for (const singleAccount of "accounts" in account
                ? account.accounts
                : [account])
                if (singleAccount.signer || singleAccount.writable) {
                  isWriteInstruction = true;
                  break;
                }
            return (
              instruction.name !== DEPLOYMENT_INSTRUCTION &&
              isWriteInstruction === (action === AbiAction.Write)
            );
          })
          .map((instruction) => ({
            key: instruction.name,
            label: <div className="function-name">{instruction.name}</div>,
            children: (
              <>
                <Form
                  form={forms[instruction.name]}
                  name={instruction.name}
                  layout="horizontal"
                  onFinish={(values) => execute(instruction, values)}
                >
                  {instruction.accounts
                    .map((account) =>
                      "accounts" in account ? account.accounts : [account]
                    ) // Flatten single account and complex accounts
                    .flat()
                    .filter(
                      (account) =>
                        !("pda" in account) && !("address" in account)
                    ) // Ignore unnecessary accounts
                    .map((account) => (
                      <Form.Item
                        key={account.name}
                        name={[ACCOUNT_PARAM, account.name]}
                        tooltip={
                          account.docs ? (
                            <>
                              {account.docs.map((doc, index) => (
                                <Fragment key={index}>
                                  {doc}
                                  <br />
                                </Fragment>
                              ))}
                            </>
                          ) : undefined
                        }
                        label={account.name}
                        required
                      >
                        <Input
                          placeholder="Public Key"
                          disabled={loading}
                          addonAfter={
                            <Select
                              defaultValue={AccountOption.Custom}
                              onChange={(value) =>
                                updateFormAccount(
                                  instruction.name,
                                  account.name,
                                  value
                                )
                              }
                            >
                              {Object.values(AccountOption).map((option) => (
                                <Select.Option key={option} value={option}>
                                  {option
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase()
                                    )}
                                </Select.Option>
                              ))}
                            </Select>
                          }
                        />
                      </Form.Item>
                    ))}
                  {instruction.args.map((arg) => (
                    <Form.Item
                      key={arg.name}
                      name={[ARG_PARAM, arg.name]}
                      label={arg.name}
                      required
                    >
                      <Input
                        placeholder={stringifyArgType(arg.type)}
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
                {Object.keys(txResponses).includes(instruction.name) && (
                  <Descriptions
                    bordered
                    size="small"
                    items={Object.entries(txResponses[instruction.name]).map(
                      ([key, value]) => ({
                        key,
                        label: capitalize(key),
                        children: value,
                      })
                    )}
                  />
                )}
              </>
            ),
          }))}
      />
    </>
  );
};

export default SolanaForm;
