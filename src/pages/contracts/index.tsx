import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import { Content } from "antd/es/layout/layout";
import {
  CONTRACT_KEY,
  DeployedContract,
  NetworkCluster,
} from "../../utils/constants";
import ContractCard from "../../components/contract-card";
import useLocalStorageState from "use-local-storage-state";
import { capitalize } from "../../utils/utils";

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useLocalStorageState<DeployedContract[]>(
    CONTRACT_KEY,
    { defaultValue: [] }
  );
  const [displayedContracts, setDisplayedContracts] = useState<
    DeployedContract[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();

  useEffect(() => {
    setDisplayedContracts(
      contracts.filter((contract) => {
        if (
          searchedName &&
          !contract.template.name
            .toLowerCase()
            .includes(searchedName.toLowerCase())
        )
          return false;
        for (const selectedNetworkCluster of selectedClusters)
          if (
            !contract.template.networkClusters
              .map((cluster) => cluster.toString())
              .includes(selectedNetworkCluster)
          )
            return false;
        return true;
      })
    );
  }, [contracts, selectedClusters, searchedName]);

  return (
    <div className="page">
      <Header
        header="Contracts"
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
        {displayedContracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </Content>
    </div>
  );
};

export default Contracts;
