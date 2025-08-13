import React, { useEffect } from "react";
import {
  Blockchain,
  ContractAddress,
  DeployedContract,
  NetworkCluster,
} from "@utils/constants";
import { v4 } from "uuid";
import { parseContractTemplateForm } from "@components/contract-template-form";
import { useForm, useWatch } from "antd/es/form/Form";
import { Button, Form, Input, Select, Space } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import "@components/contract-form/contract-form.scss";
import { useAppSelector } from "@redux/hook";
import SelectOption from "@components/select-option";

export type ContractFormStructure = {
  id: string;
  name: string;
  description?: string;
  abi: string;
  flattenSource?: string;
  addresses: ContractAddress[];
};

export const parseContractForm = (
  form: ContractFormStructure,
  blockchains: Blockchain[],
  id?: string
): DeployedContract => {
  const contractId = id ?? v4();
  return {
    id: contractId,
    template: parseContractTemplateForm({
      id: contractId,
      name: form.name,
      desscription: form.description,
      abi: form.abi,
      bytecode: "{}",
      flattenSource: form.flattenSource,
      programKeypair: "[]",
      networkClusters: blockchains
        .filter((chain) =>
          form.addresses.some((address) => address.blockchainId === chain.id)
        )
        .map((chain) => chain.networkCluster.toString()),
    }),
    addresses: form.addresses,
  };
};

const ContractForm: React.FC<{
  contractForm: { open: boolean; form?: ContractFormStructure };
  saveContract: (contract: ContractFormStructure) => void;
}> = ({ contractForm, saveContract }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [form] = useForm();
  const addresses = useWatch<ContractAddress[]>("addresses", form);

  useEffect(() => {
    if (contractForm.open) form.resetFields();
  }, [form, contractForm]);

  return (
    <Form
      form={form}
      name="save-contract"
      layout="horizontal"
      initialValues={contractForm.form}
      onFinish={(values) => saveContract(values)}
    >
      <Form.Item name="name" label="Name" required>
        <Input placeholder="Contract Name" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Description" />
      </Form.Item>
      <Form.Item name="abi" label="ABI" required>
        <Input.TextArea
          placeholder="Contract ABI (EVM) or IDL (Solana)"
          rows={4}
        />
      </Form.Item>
      <Form.Item name="flattenSource" label="Flatten Source">
        <Input.TextArea rows={4} placeholder="Contract flatten source" />
      </Form.Item>
      <Form.Item label="Addresses">
        <Form.List name="addresses">
          {(fields, { add, remove }) => (
            <div className="addresses">
              {fields.map((field) => (
                <Space key={field.key} align="baseline">
                  <Form.Item name={[field.name, "blockchainId"]}>
                    <Select
                      className="contract-chain-select"
                      placeholder="Blockchain"
                      options={blockchains.map((chain) => ({
                        label: chain.name,
                        value: chain.id,
                        emoji: chain.logo,
                      }))}
                      optionRender={(option) => (
                        <SelectOption
                          icon={option.data.emoji}
                          label={option.data.label}
                        />
                      )}
                      labelRender={({ value, label }) => {
                        const selected = blockchains.find(
                          (chain) => chain.id === value
                        );
                        return selected ? (
                          <SelectOption icon={selected.logo} label={label} />
                        ) : (
                          label
                        );
                      }}
                    />
                  </Form.Item>
                  <Form.Item name={[field.name, "address"]}>
                    <Input placeholder="Address" />
                  </Form.Item>
                  {addresses &&
                    blockchains.find(
                      (chain) =>
                        chain.id === addresses[field.name]?.blockchainId
                    )?.networkCluster === NetworkCluster.Sui && (
                      <Form.Item name={[field.name, "package"]}>
                        <Input placeholder="Package" />
                      </Form.Item>
                    )}
                  <CloseOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} block>
                <PlusOutlined /> Add Address
              </Button>
            </div>
          )}
        </Form.List>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Contract
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractForm;
