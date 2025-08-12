import React, { Fragment, useState } from "react";
import { IdlInstructionAccount } from "@utils/types/solana";
import { Dropdown, Form, Input, MenuProps, Space } from "antd";
import { concat } from "@utils/utils";
import {
  ACCOUNT_PARAM,
  AccountOption,
  defaultAccType,
  getAccountRoles,
  pdaDependees,
} from "@components/abi-form/solana-form/utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  NATIVE_MINT_2022,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  BPF_LOADER_DEPRECATED_PROGRAM_ID,
  ComputeBudgetProgram,
  Ed25519Program,
  Secp256k1Program,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

const items: MenuProps["items"] = [
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
        key: NATIVE_MINT.toString(),
        label: "Wrapped SOL",
      },
      {
        key: NATIVE_MINT_2022.toString(),
        label: "Wrapped SOL 2022",
      },
      {
        key: TOKEN_PROGRAM_ID.toString(),
        label: "Token Program",
      },
      {
        key: TOKEN_2022_PROGRAM_ID.toString(),
        label: "Token 2022 Program",
      },
      {
        key: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        label: "Associated Token Program",
      },
      {
        key: SystemProgram.programId.toString(),
        label: "System Program",
      },
      {
        key: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
        label: "Memo Program",
      },
      {
        key: Ed25519Program.programId.toString(),
        label: "Ed25519 Program",
      },
      {
        key: Secp256k1Program.programId.toString(),
        label: "Secp256k1 Program",
      },
      {
        key: BPF_LOADER_DEPRECATED_PROGRAM_ID.toString(),
        label: "BPF Loader Program",
      },
      {
        key: SYSVAR_RENT_PUBKEY.toString(),
        label: "Rent Program",
      },
      {
        key: SYSVAR_CLOCK_PUBKEY.toString(),
        label: "Clock Program",
      },
      {
        key: ComputeBudgetProgram.programId.toString(),
        label: "Compute Budget Program",
      },
    ],
  },
  {
    key: AccountOption.Derived,
    label: "Derived Account",
    disabled: true,
  },
];

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

  const isDisabled =
    disabled ||
    loading ||
    account.address !== undefined ||
    account.pda !== undefined;

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
        disabled={isDisabled}
        onChange={onInputChanged}
        addonAfter={
          <Dropdown
            trigger={["click"]}
            disabled={isDisabled}
            menu={{
              selectable: true,
              onClick: ({ keyPath }) => accTypeSelected(keyPath.reverse()),
              defaultSelectedKeys: [defaultAccType(account)],
              items: items,
            }}
          >
            <Space style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}>
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
