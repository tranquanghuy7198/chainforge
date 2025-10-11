import {
  CaretRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Form, Input, Select, Space } from "antd";
import React from "react";
import {
  ACCESS_TYPE,
  ACCESS_LIST,
  ADMIN,
  CODE_ID,
  COSMOS_ADVANCED_CONFIGS,
} from "@components/abi-form/cosmos-form/utils";
import { Wallet } from "@utils/wallets/wallet";
import { AbiAction, Blockchain } from "@utils/constants";
import AbiFormInput, {
  AddressOption,
} from "@components/abi-form/abi-form-input";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";
import { parseScreemingSnake } from "@utils/utils";
import "./cosmos-form.scss";

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
                name={[COSMOS_ADVANCED_CONFIGS, ACCESS_TYPE]}
                label="Access Type"
                tooltip="Who are allowed to instantiate a new contract from your uploaded bytecode"
              >
                <Select
                  placeholder="Instantiation authority"
                  options={Object.entries(AccessType)
                    .filter(([key]) => isNaN(Number(key)))
                    .map(([key, value]) => ({
                      label: parseScreemingSnake(key),
                      value: value,
                    }))}
                />
              </Form.Item>
              <Form.Item label="Instantiators">
                <Form.List name={[COSMOS_ADVANCED_CONFIGS, ACCESS_LIST]}>
                  {(fields, { add, remove }) => (
                    <div>
                      {fields.map((field, index) => (
                        <Space key={field.key} align="baseline">
                          <AbiFormInput
                            action={AbiAction.Deploy}
                            wallet={wallet}
                            blockchain={blockchain}
                            name={[field.name]}
                            placeholder={`Instantiator ${index}`}
                            disabled={disabled}
                            json={false}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block>
                        <PlusOutlined /> Add Instantiator
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Form.Item>
            </>
          ),
        },
      ]}
    />
  );
};

export default AdvancedCosmosConfigs;
