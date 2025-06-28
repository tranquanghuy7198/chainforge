import { Button, Form, Input, Select } from "antd";
import { NetworkCluster } from "../../utils/constants";
import { capitalize } from "../../utils/utils";
import { useForm, useWatch } from "antd/es/form/Form";
import { useEffect } from "react";

export type ContractTemplateFormStructure = {
  id: string;
  name: string;
  abi: string;
  bytecode: string;
  flattenSource?: string;
  programKeypair?: string;
  networkClusters: string[];
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

  useEffect(() => {
    if (templateForm.open) form.resetFields();
  }, [form, templateForm]);

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
        <Input.TextArea
          placeholder="Contract ABI (EVM) or IDL (Solana)"
          rows={4}
        />
      </Form.Item>
      <Form.Item name="bytecode" label="Bytecode" required>
        <Input.TextArea placeholder="Contract bytecode" rows={4} />
      </Form.Item>
      {/* <Collapse
            defaultActiveKey={["bytecodeFile"]}
            ghost
            items={[
              {
                key: "bytecodeFile",
                label: "or upload bytecode file",
                children: (
                  <Form.Item name="bytecodeFile" label="Bytecode File">
                    <Upload
                      maxCount={1}
                      listType="text"
                      beforeUpload={() => false}
                      onChange={(info) => {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const file = info.fileList[0]!;
                      }}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload Bytecode File
                      </Button>
                    </Upload>
                  </Form.Item>
                ),
              },
            ]}
          /> */}
      {(networkClusters || []).includes(NetworkCluster.Solana.toString()) && (
        <Form.Item name="programKeypair" label="Program Keypair" required>
          <Input.TextArea placeholder="[1, 2, 151, ...]" rows={2} />
        </Form.Item>
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
