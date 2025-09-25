import { Form, Input } from "antd";
import React, { Fragment, useEffect } from "react";
import { Idl, IdlInstruction } from "@utils/types/solana";
import SolanaAccountInput from "@components/abi-form/solana-form/account-input";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import useNotification from "antd/es/notification/useNotification";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@utils/wallets/wallet";
import { useForm } from "antd/es/form/Form";
import {
  ACCOUNT_PARAM,
  AccountOption,
  ARG_PARAM,
  deriveFrom,
  deserializeAccountData,
  IxRawData,
  stringifyArgType,
} from "@components/abi-form/solana-form/utils";
import lodash from "lodash";
import "@components/abi-form/solana-form/solana-form.scss";
import SolanaExtraAccountInput from "@components/abi-form/solana-form/extra-account-input";
import VSCodeEditor from "@components/vscode-editor";

const SolanaInstructionForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
  disabled: boolean;
  extraAccounts: boolean;
  defaultValue?: IxRawData;
  onIxDataChange: (data: IxRawData) => void;
}> = ({
  action,
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
  disabled,
  extraAccounts,
  defaultValue,
  onIxDataChange,
}) => {
  const [form] = useForm();
  const [notification, contextHolder] = useNotification();

  useEffect(() => {
    if (!lodash.isEqual(defaultValue, form.getFieldsValue())) {
      form.resetFields();
      form.setFieldsValue(defaultValue);
      autoFillAccounts();
    }
  }, [form, defaultValue]);

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
    onIxDataChange(form.getFieldsValue());
  };

  const updateFormAccount = async (
    accountName: string,
    accountOption: AccountOption,
    accountAddress?: string
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
      } else if (accountOption === AccountOption.System)
        accountValue = accountAddress;

      // Set it in the form and auto fill others if necessary
      if (setAccountValue(accountName, accountValue)) autoFillAccounts();
    } catch (e) {
      notification.error({
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  return (
    <div className="ix-form">
      {contextHolder}
      <Form
        form={form}
        name={instruction.name}
        layout="horizontal"
        autoComplete="off"
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
              disabled={disabled}
              onInputChanged={() => autoFillAccounts()}
              onAccountOptionChanged={(option, address) =>
                updateFormAccount(account.name, option, address)
              }
            />
          ))}
        {instruction.args.map((arg) => (
          <Form.Item
            key={arg.name}
            name={[ARG_PARAM, arg.name]}
            label={arg.name}
            required
            tooltip={
              arg.docs ? (
                <>
                  {arg.docs.map((doc, index) => (
                    <Fragment key={index}>
                      {doc}
                      <br />
                    </Fragment>
                  ))}
                </>
              ) : undefined
            }
          >
            {["vec", "array", "defined", "generic"].some((specialType) =>
              stringifyArgType(arg.type).includes(specialType)
            ) ? (
              <VSCodeEditor
                placeholder={stringifyArgType(arg.type)}
                onChange={() => onIxDataChange(form.getFieldsValue())}
                disabled={disabled}
              />
            ) : (
              <Input
                placeholder={stringifyArgType(arg.type)}
                onChange={() => onIxDataChange(form.getFieldsValue())}
                disabled={disabled}
              />
            )}
          </Form.Item>
        ))}
        {action === AbiAction.Write && extraAccounts && (
          <SolanaExtraAccountInput
            disabled={disabled}
            onChange={() => onIxDataChange(form.getFieldsValue())}
          />
        )}
      </Form>
    </div>
  );
};

export default SolanaInstructionForm;
