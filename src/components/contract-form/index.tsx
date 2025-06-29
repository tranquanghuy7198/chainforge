import React, { useEffect } from "react";
import { ContractAddress, DeployedContract } from "../../utils/constants";
import { v4 } from "uuid";
import { parseContractTemplateForm } from "../contract-template-form";
import { useForm } from "antd/es/form/Form";
import { Button, Form, Input } from "antd";

export type ContractFormStructure = {
  id: string;
  name: string;
  abi: string;
  flattenSource?: string;
  addresses: ContractAddress[];
};

export const parseContractForm = (
  form: ContractFormStructure,
  id?: string
): DeployedContract => {
  const contractId = id ?? v4();
  return {
    id: contractId,
    template: parseContractTemplateForm({
      id: contractId,
      name: form.name,
      abi: form.abi,
      bytecode: "{}",
      flattenSource: form.flattenSource,
      programKeypair: "[]",
      networkClusters: [],
    }),
    addresses: form.addresses,
  };
};

const ContractForm: React.FC<{
  contractForm: { open: boolean; form?: ContractFormStructure };
  saveContract: (contract: ContractFormStructure) => void;
}> = ({ contractForm, saveContract }) => {
  const [form] = useForm();

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
      <Form.Item name="abi" label="ABI" required>
        <Input.TextArea
          placeholder="Contract ABI (EVM) or IDL (Solana)"
          rows={4}
        />
      </Form.Item>
      <Form.Item name="flattenSource" label="Flatten Source">
        <Input.TextArea rows={4} placeholder="Contract flatten source" />
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
