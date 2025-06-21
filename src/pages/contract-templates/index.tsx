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

const ContractTemplates: React.FC = () => {
  const [contractTemplates] = useLocalStorageState<ContractTemplate[]>(
    CONTRACT_TEMPLATE_KEY,
    { defaultValue: [] }
  );
  const [displayedTemplates, setDisplayedTemplates] = useState<
    ContractTemplate[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();

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
        onAddRequested={() => {}}
        defaultSelectAll={false}
      />
      <Content className="item-dashboard">
        {displayedTemplates.map((template) => (
          <ContractTemplateCard contractTemplate={template} />
        ))}
      </Content>
    </div>
  );
};

export default ContractTemplates;
