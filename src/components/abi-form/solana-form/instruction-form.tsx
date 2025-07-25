import { Form, Input } from "antd";
import React, { useEffect } from "react";
import { Idl, IdlInstruction } from "../../../utils/types/solana";
import SolanaAccountInput from "./account-input";
import {
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "../../../utils/constants";
import useNotification from "antd/es/notification/useNotification";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../../../utils/wallets/wallet";
import { useForm } from "antd/es/form/Form";
import {
  ACCOUNT_PARAM,
  AccountOption,
  ARG_PARAM,
  deriveFrom,
  deserializeAccountData,
  stringifyArgType,
} from "./utils";
import lodash from "lodash";
import "./solana-form.scss";

const SolanaInstructionForm: React.FC<{
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
  disabled: boolean;
}> = ({
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
  disabled,
}) => {
  const [form] = useForm();
  const [notification, contextHolder] = useNotification();

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
      <Form form={form} name={instruction.name} layout="horizontal">
        {instruction.accounts
          .map((account) =>
            "accounts" in account ? account.accounts : [account]
          ) // Flatten single account and complex accounts
          .flat()
          .map((account) => (
            <SolanaAccountInput
              key={account.name}
              account={account}
              disabled={disabled}
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
              disabled={disabled}
            />
          </Form.Item>
        ))}
      </Form>
    </>
  );
};

export default SolanaInstructionForm;
