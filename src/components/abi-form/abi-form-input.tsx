import {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Dropdown, Form, Input, MenuProps, Space } from "antd";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import { NamePath } from "antd/es/form/interface";
import { Wallet } from "@utils/wallets/wallet";
import { Blockchain, ContractAddress } from "@utils/constants";
import VSCodeEditor from "@components/vscode-editor";

enum AddressOption {
  Custom = "custom-value",
  Wallet = "wallet-address",
  Contract = "contract-address",
}

const items: MenuProps["items"] = [
  {
    key: AddressOption.Custom,
    label: "Custom Value",
  },
  {
    key: AddressOption.Wallet,
    label: "Wallet Address",
  },
  {
    key: AddressOption.Contract,
    label: "Contract Address",
  },
];

interface AbiFormInputProps {
  wallet?: Wallet;
  blockchain?: Blockchain;
  contractAddress?: ContractAddress;
  name: NamePath;
  label?: ReactNode;
  tooltip?: ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  json: boolean;
}

interface AbiFormInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string | undefined;
}

const AbiFormInput = forwardRef<AbiFormInputRef, AbiFormInputProps>(
  (
    {
      wallet,
      blockchain,
      contractAddress,
      name,
      label,
      tooltip,
      required,
      placeholder,
      disabled,
      json,
    },
    ref
  ) => {
    const [accType, setAccType] = useState<string>(AddressOption.Custom);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<any>(null);
    const form = Form.useFormInstance();
    const isDisabled = disabled || loading;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () =>
        inputRef.current?.getModel()?.setValue(inputRef.current?.getValue()),
      getValue: () => inputRef.current?.getValue(),
    }));

    const handleEditorChange = (value: string | undefined) => {
      form.setFieldValue(name, value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setFieldValue(name, e.target.value);
    };

    const accTypeSelected = async (keyPath: string[]) => {
      setLoading(true);
      if (keyPath.length === 0) {
        return;
      }

      // Find auto-complete value
      setAccType(keyPath[0]);
      let address = undefined;
      switch (keyPath[0]) {
        case AddressOption.Contract:
          if (!contractAddress)
            throw new Error("You must select a contract first");
          address = contractAddress.address;
          break;
        case AddressOption.Wallet:
          if (!wallet) throw new Error("You must select a wallet first");
          if (!blockchain)
            throw new Error("You must select a blockchain first");
          await wallet.connect(blockchain);
          address = wallet.address;
          break;
      }

      // Set the address value to the input
      form.setFieldValue(name, address);
      setLoading(false);
    };

    return (
      <Form.Item
        name={name}
        tooltip={tooltip}
        label={label}
        required={required}
      >
        {json ? (
          <VSCodeEditor
            ref={inputRef}
            placeholder={placeholder}
            disabled={isDisabled}
            onChange={handleEditorChange}
          />
        ) : (
          <Input
            ref={inputRef}
            placeholder={placeholder}
            disabled={isDisabled}
            onChange={handleInputChange}
            addonAfter={
              <Dropdown
                trigger={["click"]}
                disabled={isDisabled}
                menu={{
                  selectable: true,
                  onClick: ({ keyPath }) => accTypeSelected(keyPath.reverse()),
                  defaultSelectedKeys: [AddressOption.Custom],
                  items: items,
                }}
              >
                <Space
                  style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                >
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
        )}
      </Form.Item>
    );
  }
);

export default AbiFormInput;
