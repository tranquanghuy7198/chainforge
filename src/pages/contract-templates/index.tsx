import React, { useEffect, useState } from "react";
import "./contract-templates.scss";
import useLocalStorageState from "use-local-storage-state";
import {
  CONTRACT_TEMPLATE_KEY,
  ContractTemplate,
  NetworkCluster,
} from "../../utils/constants";
import Header from "../../components/header";
import { Content } from "antd/es/layout/layout";
import ContractTemplateCard from "../../components/contract-template-card";
import { capitalize } from "../../utils/utils";
import { Button, Drawer, Form, Input, notification, Select } from "antd";
import { v4 } from "uuid";

const ContractTemplates: React.FC = () => {
  const [contractTemplates, setContractTemplates] = useLocalStorageState<
    ContractTemplate[]
  >(CONTRACT_TEMPLATE_KEY, { defaultValue: [] });
  const [displayedTemplates, setDisplayedTemplates] = useState<
    ContractTemplate[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();
  let [addTemplate, setAddTemplate] = useState<boolean>(false);

  useEffect(() => {
    setDisplayedTemplates(
      contractTemplates.filter((template) => {
        if (
          searchedName &&
          !template.name.toLowerCase().includes(searchedName.toLowerCase())
        )
          return false;
        for (const selectedNetworkCluster of selectedClusters)
          if (
            !template.networkClusters
              .map((cluster) => cluster.toString())
              .includes(selectedNetworkCluster)
          )
            return false;
        return true;
      })
    );
  }, [contractTemplates, selectedClusters, searchedName]);

  const parseToContractTemplate = ({
    name,
    abi,
    bytecode,
    flattenSource,
    networkClusters,
  }: {
    name: string;
    abi: string;
    bytecode: string;
    flattenSource: string;
    networkClusters: string[];
  }): ContractTemplate => {
    const parsedAbi = JSON.parse(abi);
    if (
      !Array.isArray(parsedAbi) ||
      !parsedAbi.every(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    ) {
      notification.error({
        message: "Invalid ABI",
        description: "Your ABI is invalid, please check again!",
      });
      throw new Error("Invalid ABI");
    }
    return {
      id: v4(),
      name,
      abi: parsedAbi,
      bytecode,
      flattenSource,
      networkClusters: networkClusters.map(
        (cluster) => cluster as NetworkCluster
      ),
    };
  };

  const saveContractTemplate = (template: ContractTemplate) => {
    setContractTemplates([...contractTemplates, template]);
    notification.success({
      message: "Contract Created",
      description: "A new contract template has been created",
    });
  };

  return (
    <div className="page">
      <Header
        header="Contract Templates"
        options={Object.values(NetworkCluster).map((cluster) => ({
          value: cluster.toString(),
          label: capitalize(cluster.toString()),
        }))}
        onSelected={setSelectedClusters}
        onSearched={setSearchedName}
        onAddRequested={() => {
          setAddTemplate(true);
        }}
        defaultSelectAll={false}
      />
      <Content className="item-dashboard">
        {displayedTemplates.map((template) => (
          <ContractTemplateCard contractTemplate={template} />
        ))}
      </Content>
      <Drawer
        width={500}
        title="Add Contract Template"
        open={addTemplate}
        closable={true}
        onClose={() => setAddTemplate(false)}
      >
        <Form
          name="add-contract-template"
          layout="horizontal"
          onFinish={(values) =>
            saveContractTemplate(parseToContractTemplate(values))
          }
        >
          <Form.Item name="name" label="Name" required>
            <Input placeholder="Contract Name" />
          </Form.Item>
          <Form.Item name="abi" label="ABI" required>
            <Input.TextArea placeholder="Contract ABI" rows={4} />
          </Form.Item>
          <Form.Item name="bytecode" label="Bytecode" required>
            <Input.TextArea placeholder="Contract bytecode" rows={4} />
          </Form.Item>
          <Form.Item name="flattenSource" label="Flatten Source" required>
            <Input.TextArea rows={4} />
          </Form.Item>
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Template
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ContractTemplates;
