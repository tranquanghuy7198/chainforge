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

enum AddressOption {
  Custom = "custom-address",
  Wallet = "wallet-address",
  Contract = "contract-address",
}

const items: MenuProps["items"] = [
  {
    key: AddressOption.Custom,
    label: "Custom Account",
  },
  {
    key: AddressOption.Wallet,
    label: "Wallet Account",
  },
  {
    key: AddressOption.Contract,
    label: "Program Account",
  },
];

interface AbiFormInputProps {
  wallet?: Wallet;
  blockchain?: Blockchain;
  contractAddress?: ContractAddress;
  value?: string;
  onChange?: (value: string | undefined, event: any) => void;
  onBlur?: () => void;
  name: NamePath;
  label?: ReactNode;
  tooltip?: ReactNode;
  required: boolean;
  placeholder?: string;
  disabled?: boolean;
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
      value,
      onChange,
      onBlur,
      name,
      label,
      tooltip,
      required,
      placeholder,
      disabled,
    },
    ref
  ) => {
    const [accType, setAccType] = useState<string>(AddressOption.Custom);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<any>(null);
    const isDisabled = disabled || loading;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () =>
        inputRef.current?.getModel()?.setValue(inputRef.current?.getValue()),
      getValue: () => inputRef.current?.getValue(),
    }));

    const handleEditorChange = (value: string | undefined) => {
      onChange?.(value, null);
    };

    const handleEditorBlur = () => {
      onBlur?.();
    };

    const accTypeSelected = async (keyPath: string[]) => {
      setLoading(true);
      if (keyPath.length === 0) {
        setLoading(false);
        return;
      }
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
      // TODO: Set this address value to the input
      setLoading(false);
    };

    return (
      <Form.Item
        name={name}
        tooltip={tooltip}
        label={label}
        required={required}
      >
        <Input
          placeholder={placeholder}
          disabled={isDisabled}
          onChange={handleEditorChange}
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
  }
);

export default AbiFormInput;
