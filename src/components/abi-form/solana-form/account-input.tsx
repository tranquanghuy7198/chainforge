import React, { Fragment, useState } from "react";
import { IdlInstructionAccount } from "../../../utils/types/solana";
import { Dropdown, Form, Input, Space } from "antd";
import { concat } from "../../../utils/utils";
import {
  ACCOUNT_PARAM,
  AccountOption,
  defaultAccType,
  getAccountRoles,
  pdaDependees,
} from "./utils";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import "./solana-form.scss";

const SolanaAccountInput: React.FC<{
  account: IdlInstructionAccount;
  disabled: boolean;
  onInputChanged: () => void;
  onAccountOptionChanged: (
    option: AccountOption,
    address?: string
  ) => Promise<void>;
}> = ({ account, disabled, onInputChanged, onAccountOptionChanged }) => {
  const [accType, setAccType] = useState<string>(defaultAccType(account));
  const [loading, setLoading] = useState<boolean>(false);

  const accTypeSelected = async (keyPath: string[]) => {
    setLoading(true);
    if (keyPath.length === 0) {
      setLoading(false);
      return;
    }
    setAccType(keyPath[0]);
    await onAccountOptionChanged(
      keyPath[0] as AccountOption,
      keyPath.length > 1 ? keyPath[1] : undefined
    );
    setLoading(false);
  };

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
          disabled ||
          loading ||
          account.address !== undefined ||
          account.pda !== undefined
        }
        onChange={onInputChanged}
        addonAfter={
          <Dropdown
            trigger={["click"]}
            disabled={
              disabled ||
              loading ||
              account.address !== undefined ||
              account.pda !== undefined
            }
            menu={{
              selectable: true,
              onClick: ({ keyPath }) => accTypeSelected(keyPath.reverse()),
              defaultSelectedKeys: [defaultAccType(account)],
              items: [
                {
                  key: AccountOption.Custom,
                  label: "Custom Account",
                },
                {
                  key: AccountOption.Wallet,
                  label: "Wallet Account",
                },
                {
                  key: AccountOption.Program,
                  label: "Program Account",
                },
                {
                  key: AccountOption.System,
                  label: "System Account",
                  children: [
                    {
                      key: TOKEN_PROGRAM_ID.toString(),
                      label: "Token Program",
                    },
                    {
                      key: TOKEN_2022_PROGRAM_ID.toString(),
                      label: "Token 2022 Program",
                    },
                  ],
                },
                {
                  key: AccountOption.Derived,
                  label: "Derived Account",
                  disabled: true,
                },
              ],
            }}
          >
            <Space className="acc-type-select">
              <>
                {accType
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </>
              {loading ? <LoadingOutlined /> : <DownOutlined />}
            </Space>
          </Dropdown>
        }
      />
    </Form.Item>
  );
};

export default SolanaAccountInput;
