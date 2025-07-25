import { Button, Descriptions, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { Idl, IdlInstruction } from "../../../utils/types/solana";
import SolanaAccountInput from "./account-input";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "../../../utils/constants";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { capitalize } from "../../../utils/utils";
import useNotification from "antd/es/notification/useNotification";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../../../utils/wallets/wallet";
import { useForm } from "antd/es/form/Form";
import Paragraph from "antd/es/typography/Paragraph";
import {
  ACCOUNT_PARAM,
  AccountOption,
  ARG_PARAM,
  deriveFrom,
  deserializeAccountData,
  SolanaIdlParser,
  stringifyArgType,
} from "./utils";
import { SolanaExtra } from "../../../utils/wallets/solana/utils";
import lodash from "lodash";
import "./solana-form.scss";
import camelcase from "camelcase";

const SolanaInstructionForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
  setFormData: (formData: Record<string, Record<string, string>>) => void;
  saveDeployedContract: (blockchain: Blockchain, address: string) => void;
}> = ({
  action,
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
  setFormData,
  saveDeployedContract,
}) => {
  const [form] = useForm();
  const [notification, contextHolder] = useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [txResponse, setTxResponse] = useState<TxResponse>();

  useEffect(() => {
    autoFillAccounts();
  }, [form]);

  const setAccountValue = (
    accountName: string,
    accountValue?: string
  ): boolean => {
    const currentValue = form.getFieldValue([ACCOUNT_PARAM, accountName]);
    if (currentValue !== accountValue) {
      form.setFieldValue([ACCOUNT_PARAM, accountName], accountValue);
      return true;
    }
    return false;
  };

  const autoFillAccounts = async () => {
    let changed = false;
    do {
      changed = false; // Reset and try once more
      for (const account of instruction.accounts)
        for (const singleAccount of "accounts" in account
          ? account.accounts
          : [account]) {
          // System accounts
          if (singleAccount.address)
            changed ||= setAccountValue(
              singleAccount.name,
              singleAccount.address
            );
          // Derived accounts
          else if (singleAccount.pda) {
            if (!singleAccount.pda.program && !contractAddress)
              // Must have at least 1 program to derive from
              continue;

            // Find all dependees
            const dependees: Record<string, PublicKey> = {};
            let notEnoughDependees = false;
            const seeds = [...singleAccount.pda.seeds]; // Copy value, avoid array pointer
            if (singleAccount.pda.program)
              seeds.push(singleAccount.pda.program);
            for (const seed of seeds)
              if (seed.kind === "account")
                try {
                  const path = seed.path.split(".");
                  if (path.length === 1)
                    dependees[seed.path] = new PublicKey(
                      form.getFieldValue([ACCOUNT_PARAM, seed.path])
                    );
                  else if (seed.account) {
                    const accData = await deserializeAccountData(
                      form.getFieldValue([ACCOUNT_PARAM, path[0]]),
                      seed.account,
                      contractTemplate.abi as Idl,
                      blockchain
                    );
                    dependees[seed.path] = lodash.get(accData, path.slice(1));
                  } else throw new Error("Invalid account path");
                } catch {
                  notEnoughDependees = true; // Not a valid public key, or not filled yet
                  break;
                }
            if (notEnoughDependees) {
              // Not enough dependees to calculate this account, clear current value
              changed ||= setAccountValue(singleAccount.name, undefined);
              continue;
            }

            // Calculate derived account from dependees
            const [derivedAccount] = PublicKey.findProgramAddressSync(
              singleAccount.pda.seeds.map(
                (seed) =>
                  seed.kind === "const"
                    ? Buffer.from(seed.value)
                    : seed.kind === "account"
                    ? dependees[seed.path].toBuffer()
                    : Buffer.from([]) // TODO: seed.kind === "args", not handled yet
              ),
              deriveFrom(
                dependees,
                singleAccount.pda.program,
                contractAddress?.address
              )
            );
            changed ||= setAccountValue(
              singleAccount.name,
              derivedAccount.toString()
            );
          }
        }
    } while (changed);
    setFormData(form.getFieldsValue());
  };

  const deploy = async (
    wallet: Wallet,
    blockchain: Blockchain
  ): Promise<TxResponse> => {
    const response = await wallet.deploy(
      blockchain,
      contractTemplate.abi,
      contractTemplate.bytecode,
      null,
      { programKeypair: contractTemplate.programKeypair } as SolanaExtra
    );
    saveDeployedContract(blockchain, response.contractAddress!);
    return response;
  };

  const read = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
  ): Promise<TxResponse | undefined> => {
    if (!contractAddress) {
      notification.error({
        message: "No contract selected",
        description: "You must select a contract first",
      });
      return;
    }
    return await wallet.readContract(
      blockchain,
      contractAddress.address,
      contractTemplate.abi,
      camelcase(instruction.name),
      [args, accounts]
    );
  };

  const write = async (
    wallet: Wallet,
    blockchain: Blockchain,
    instruction: IdlInstruction,
    args: any[],
    accounts: Record<string, PublicKey>
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
      contractAddress.address,
      contractTemplate.abi,
      camelcase(instruction.name),
      [args, accounts],
      {} as SolanaExtra
    );
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
    setTxResponse(undefined);

    // Execute
    try {
      // Prepare args and accounts
      const argParser = new SolanaIdlParser(contractTemplate.abi as Idl);
      const args = instruction.args.map((arg) =>
        argParser.parseValue((params[ARG_PARAM] || {})[arg.name], arg.type)
      );
      const accounts = Object.fromEntries(
        Object.entries(params[ACCOUNT_PARAM] || {}).map(([key, value]) => [
          camelcase(key),
          new PublicKey(value),
        ])
      );

      // Execute in wallet
      let response: TxResponse | undefined;
      if (action === AbiAction.Deploy)
        response = await deploy(wallet, blockchain);
      else if (action === AbiAction.Read)
        response = await read(wallet, blockchain, instruction, args, accounts);
      else if (action === AbiAction.Write)
        response = await write(wallet, blockchain, instruction, args, accounts);
      setTxResponse(response);
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

      // Set it in the form and auto fill others if necessary
      if (setAccountValue(accountName, accountValue)) autoFillAccounts();
    } catch (e) {
      notification.error({
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name={instruction.name}
        layout="horizontal"
        onFinish={(values) => execute(instruction, values)}
      >
        {instruction.accounts
          .map((account) =>
            "accounts" in account ? account.accounts : [account]
          ) // Flatten single account and complex accounts
          .flat()
          .map((account) => (
            <SolanaAccountInput
              key={account.name}
              account={account}
              disabled={loading}
              onInputChanged={() => autoFillAccounts()}
              onAccountOptionChanged={(option) =>
                updateFormAccount(account.name, option)
              }
            />
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
          <div className="instruction-actions">
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
            {action === AbiAction.Write && (
              <Button
                type="link"
                icon={<ThunderboltOutlined />}
                // onClick={() => setWriteFull(true)}
              >
                Supportive Instructions
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>
      {txResponse && (
        <Descriptions
          bordered
          size="small"
          items={Object.entries(txResponse).map(([key, value]) => ({
            key,
            label: capitalize(key),
            children: value,
          }))}
        />
      )}
    </>
  );
};

export default SolanaInstructionForm;
