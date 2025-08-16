import { Alert, Button, Form, Input, Select } from "antd";
import { ContractTemplate, NetworkCluster } from "@utils/constants";
import { capitalize } from "@utils/utils";
import { useForm, useWatch } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import { v4 } from "uuid";
import { Keypair } from "@solana/web3.js";
import Editor from "@monaco-editor/react";
import "./contract-template-form.scss";

export type ContractTemplateFormStructure = {
  id: string;
  name: string;
  desscription?: string;
  abi: string;
  bytecode: string;
  flattenSource?: string;
  programKeypair?: string;
  networkClusters: string[];
};

export const parseContractTemplateForm = (
  form: ContractTemplateFormStructure,
  id?: string
): ContractTemplate => {
  return {
    id: id ?? v4(),
    name: form.name,
    description: form.desscription,
    abi: JSON.parse(form.abi),
    bytecode: form.bytecode,
    flattenSource: form.flattenSource,
    programKeypair: form.programKeypair
      ? (JSON.parse(form.programKeypair) as number[])
      : undefined,
    networkClusters: form.networkClusters.map(
      (cluster) => cluster as NetworkCluster
    ),
  };
};

const ContractTemplateForm: React.FC<{
  templateForm: {
    open: boolean;
    form?: ContractTemplateFormStructure;
  };
  saveContractTemplate: (template: ContractTemplateFormStructure) => void;
}> = ({ templateForm, saveContractTemplate }) => {
  const [form] = useForm();
  const networkClusters = useWatch<string[]>("networkClusters", form);
  const [solanaProgramId, setSolanaProgramId] = useState<string>();

  useEffect(() => {
    if (templateForm.open) form.resetFields();
    if (templateForm.form?.programKeypair)
      extractProgramId(templateForm.form.programKeypair);
  }, [form, templateForm]);

  const readBytecodeFile = async (bytecodeFile: File): Promise<boolean> => {
    const bytecodeBuffer: ArrayBuffer = await bytecodeFile.arrayBuffer();
    const bytecodeBytes = new Uint8Array(bytecodeBuffer);
    form.setFieldValue("bytecode", Buffer.from(bytecodeBytes).toString("hex"));
    return false;
  };

  const extractProgramId = (programKeypair: string) => {
    try {
      setSolanaProgramId(
        `Program ID: ${Keypair.fromSecretKey(
          Uint8Array.from(JSON.parse(programKeypair))
        ).publicKey.toBase58()}`
      );
    } catch (e) {
      setSolanaProgramId("");
    }
  };

  return (
    <Form
      form={form}
      name="save-contract-template"
      layout="horizontal"
      initialValues={templateForm.form}
      onFinish={(values) => saveContractTemplate(values)}
    >
      <Form.Item name="networkClusters" label="Network Clusters" required>
        <Select
          options={Object.values(NetworkCluster).map((cluster) => ({
            value: cluster.toString(),
            label: capitalize(cluster.toString()),
          }))}
          mode="multiple"
          allowClear
        />
      </Form.Item>
      <Form.Item name="name" label="Name" required>
        <Input placeholder="Contract Name" />
      </Form.Item>
      <Form.Item name="abi" label="ABI" required>
        {/* <Input.TextArea
          placeholder="Contract ABI (EVM) or IDL (Solana)"
          rows={4}
        /> */}
        <Editor
          theme="vs-dark"
          defaultLanguage="json"
          height={150}
          options={{
            minimap: { enabled: false },
            tabIndex: 2,
            lineNumbers: "off",
            placeholder: "Contract ABI (EVM) or IDL (Solana)",
          }}
          // className="ant-input ant-input-outlined"
        />
      </Form.Item>
      <Form.Item name="bytecode" label="Bytecode" required>
        <Input.TextArea placeholder="Contract bytecode" rows={4} />
      </Form.Item>
      {(networkClusters || []).includes(NetworkCluster.Solana.toString()) && (
        <Form.Item name="bytecodeFile" label="Bytecode File">
          <Dragger
            name="bytecodeFile"
            multiple={false}
            accept=".so"
            beforeUpload={(file) => readBytecodeFile(file)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag .so file to this area to upload
            </p>
            <p className="ant-upload-hint">Support Solana .so files only.</p>
          </Dragger>
        </Form.Item>
      )}
      {(networkClusters || []).includes(NetworkCluster.Solana.toString()) && (
        <>
          <Form.Item name="programKeypair" label="Program Keypair" required>
            <Input.TextArea
              placeholder="[1, 2, 151, ...]"
              rows={2}
              onChange={(event) => extractProgramId(event.target.value)}
            />
          </Form.Item>
          <Alert
            showIcon
            type={solanaProgramId ? "info" : "error"}
            message={solanaProgramId || "Invalid program keypair"}
            className="solana-program-keypair-alert"
          />
        </>
      )}
      {(networkClusters || []).some((networkCluster) =>
        [
          NetworkCluster.Ethereum,
          NetworkCluster.Ronin,
          NetworkCluster.KardiaChain,
          NetworkCluster.Klaytn,
        ]
          .map((cluster) => cluster.toString())
          .includes(networkCluster)
      ) && (
        <Form.Item name="flattenSource" label="Flatten Source">
          <Input.TextArea rows={4} placeholder="Contract flatten source" />
        </Form.Item>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Template
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractTemplateForm;
