import React, { useEffect, useState } from "react";
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
import SelectOption from "@components/select-option";
import VSCodeEditor from "@components/vscode-editor";
import { useFetchBlockchains } from "@hooks/blockchain";
import Bookmark from "@components/bookmark";

export type ContractFormStructure = {
  contractId: string;
  templateId: string;
  name: string;
  description?: string;
  abi: string;
  flattenSource?: string;
  addresses: ContractAddress[];
};

export const parseContractForm = (
  form: ContractFormStructure,
  blockchains: Blockchain[]
): DeployedContract => {
  return {
    id: form.contractId,
    template: parseContractTemplateForm({
      id: form.templateId,
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
  saveContract: (contract: ContractFormStructure) => Promise<void>;
}> = ({ contractForm, saveContract }) => {
  const { blockchains } = useFetchBlockchains();
  const [form] = useForm();
  const addresses = useWatch<ContractAddress[]>("addresses", form);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (contractForm.open) form.resetFields();
  }, [form, contractForm]);

  const save = async (values: any) => {
    setLoading(true);
    await saveContract({
      // Editable values
      ...values,

      // Create: No IDs - gen new, edit: get IDs from contractForm.form
      contractId: contractForm.form?.contractId ?? v4(),
      templateId: contractForm.form?.templateId ?? v4(),
    });
    setLoading(false);
  };

  return (
    <Form
      form={form}
      name="save-contract"
      layout="horizontal"
      initialValues={contractForm.form}
      onFinish={save}
    >
      <Form.Item name="name" label="Name" required>
        <Input placeholder="Contract Name" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Description" />
      </Form.Item>
      <Form.Item name="abi" label="ABI" required>
        <VSCodeEditor placeholder="Contract ABI (EVM) or IDL (Solana)" />
      </Form.Item>
      <Form.Item name="flattenSource" label="Flatten Source">
        <Input.TextArea rows={4} placeholder="Contract flatten source" />
      </Form.Item>
      <Form.Item
        label="Addresses"
        tooltip="By publishing this contract, you allow everyone to see and interact with it. To do so, you must be its owner or deployer"
      >
        <Form.List name="addresses">
          {(fields, { add, remove }) => (
            <div className="addresses">
              {fields.map((field) => (
                <Space key={field.key} align="baseline">
                  <Form.Item
                    name={[field.name, "publicity"]}
                    valuePropName="checked"
                  >
                    <Bookmark />
                  </Form.Item>
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
                  <Button
                    type="text"
                    shape="circle"
                    icon={<CloseOutlined />}
                    onClick={() => remove(field.name)}
                  />
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
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Contract
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractForm;
