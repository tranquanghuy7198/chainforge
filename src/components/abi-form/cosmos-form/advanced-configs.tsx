import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, Form, Input } from "antd";
import React from "react";
import {
  ACCESS,
  ADMIN,
  CODE_ID,
  COSMOS_ADVANCED_CONFIGS,
} from "@components/abi-form/cosmos-form/utils";
import { Wallet } from "@utils/wallets/wallet";
import { AbiAction, Blockchain } from "@utils/constants";
import "./cosmos-form.scss";
import AbiFormInput, {
  AddressOption,
} from "@components/abi-form/abi-form-input";

const AdvancedCosmosConfigs: React.FC<{
  wallet?: Wallet;
  blockchain?: Blockchain;
  disabled: boolean;
}> = ({ wallet, blockchain, disabled }) => {
  return (
    <Collapse
      bordered={false}
      defaultActiveKey={[]}
      size="small"
      className="advanced-configs"
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      items={[
        {
          key: "1",
          label: "Advanced Configs",
          children: (
            <>
              <Form.Item
                name={[COSMOS_ADVANCED_CONFIGS, CODE_ID]}
                label="Code ID"
                tooltip="Use an available code ID to instantiate the contract instead of uploading bytecode again"
              >
                <Input placeholder="Use available code ID" />
              </Form.Item>
              <AbiFormInput
                action={AbiAction.Deploy}
                wallet={wallet}
                blockchain={blockchain}
                contractAddress={undefined}
                name={[COSMOS_ADVANCED_CONFIGS, ADMIN]}
                label="Admin"
                tooltip="Specify an admin to upgrade this contract later. If not specified, contract cannot be upgraded in the future"
                required={false}
                placeholder="Upgrade authorized admin"
                disabled={disabled}
                defaultOption={AddressOption.Wallet}
                json={false}
              />
              <Form.Item
                name={[COSMOS_ADVANCED_CONFIGS, ACCESS]}
                label="Access"
                tooltip="Who are allowed to instantiate a new contract from your uploaded bytecode"
              >
                <Input placeholder="Instantiation authority" />
              </Form.Item>
            </>
          ),
        },
      ]}
    />
  );
};

export default AdvancedCosmosConfigs;
