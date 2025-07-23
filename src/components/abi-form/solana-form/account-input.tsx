import React, { Fragment } from "react";
import {
  ACCOUNT_PARAM,
  getAccountRoles,
  IdlInstructionAccount,
  pdaDependees,
} from "../../../utils/types/solana";
import { Form, Input, Select } from "antd";
import { concat } from "../../../utils/utils";
import { AccountOption } from "./utils";

const SolanaAccountInput: React.FC<{
  account: IdlInstructionAccount;
  disabled: boolean;
  onInputChanged: () => void;
  onAccountOptionChanged: (option: AccountOption) => void;
}> = ({ account, disabled, onInputChanged, onAccountOptionChanged }) => {
  return (
    <Form.Item
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
      help={
        getAccountRoles(account) ? (
          <div className="solana-acc-roles">
            {getAccountRoles(account).join(" | ")}
          </div>
        ) : undefined
      }
      required
    >
      <Input
        placeholder={
          pdaDependees(account.pda).length > 0
            ? `Derived from ${concat(pdaDependees(account.pda))}`
            : "Public Key"
        }
        disabled={
          disabled || account.address !== undefined || account.pda !== undefined
        }
        onChange={onInputChanged}
        addonAfter={
          <Select
            disabled={
              disabled ||
              account.address !== undefined ||
              account.pda !== undefined
            }
            defaultValue={
              account.address
                ? AccountOption.System
                : account.pda
                ? AccountOption.Derived
                : AccountOption.Custom
            }
            onSelect={onAccountOptionChanged}
          >
            {Object.values(AccountOption).map((option) => (
              <Select.Option
                key={option}
                value={option}
                disabled={[
                  AccountOption.System,
                  AccountOption.Derived,
                ].includes(option)}
              >
                {option
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </Select.Option>
            ))}
          </Select>
        }
      />
    </Form.Item>
  );
};

export default SolanaAccountInput;
