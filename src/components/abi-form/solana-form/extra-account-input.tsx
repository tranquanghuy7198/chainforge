import React from "react";
import { Button, Checkbox, Flex, Form, Input, Space } from "antd";
import {
  EXTRA_ACCOUNT,
  EXTRA_ACCOUNT_PARAM,
  EXTRA_SIGNER,
  EXTRA_WRITABLE,
} from "./utils";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const SolanaExtraAccountInput: React.FC<{
  disabled: boolean;
}> = ({ disabled }) => {
  return (
    <Form.Item label="Remaining Accounts">
      <Form.List name={EXTRA_ACCOUNT_PARAM}>
        {(fields, { add, remove }) => (
          <Flex vertical justify="stretch">
            {fields.map((field) => (
              <Space key={field.key} align="baseline">
                <Form.Item name={[field.name, EXTRA_SIGNER]}>
                  <Checkbox disabled={disabled}>Signer</Checkbox>
                </Form.Item>
                <Form.Item name={[field.name, EXTRA_WRITABLE]}>
                  <Checkbox disabled={disabled}>Writable</Checkbox>
                </Form.Item>
                <Form.Item name={[field.name, EXTRA_ACCOUNT]}>
                  <Input placeholder="Extra Account" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} block>
              <PlusOutlined /> Add Extra Account
            </Button>
          </Flex>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default SolanaExtraAccountInput;
