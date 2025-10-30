import React, { useEffect, useState } from "react";
import Header from "@components/header";
import { DeployedContract, NetworkCluster } from "@utils/constants";
import ContractCard from "@components/contract-card";
import { capitalize } from "@utils/utils";
import { XBlock, XMasonry } from "react-xmasonry";
import { useFetchBlockchains } from "@hooks/blockchain";
import { useFetchPopularContracts } from "@hooks/contract";
import MainLayout from "@components/main-layout";

const TrendingContracts: React.FC = () => {
  const { blockchains } = useFetchBlockchains();
  const { trendingContracts, trendingLoading } = useFetchPopularContracts();
  const [displayedContracts, setDisplayedContracts] = useState<
    DeployedContract[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();

  useEffect(() => {
    setDisplayedContracts(
      trendingContracts.filter((contract) => {
        if (
          searchedName &&
          !contract.template.name
            .toLowerCase()
            .includes(searchedName.toLowerCase())
        )
          return false;
        for (const selectedNetworkCluster of selectedClusters)
          if (
            !blockchains
              .filter((chain) =>
                contract.addresses
                  .map((address) => address.blockchainId)
                  .includes(chain.id)
              )
              .map((chain) => chain.networkCluster.toString())
              .includes(selectedNetworkCluster)
          )
            return false;
        return true;
      })
    );
  }, [trendingContracts, blockchains, selectedClusters, searchedName]);

  return (
    <MainLayout loading={trendingLoading}>
      <Header
        header="Popular Contracts"
        options={Object.values(NetworkCluster).map((cluster) => ({
          value: cluster.toString(),
          label: capitalize(cluster.toString()),
        }))}
        onSelected={setSelectedClusters}
        onSearched={setSearchedName}
        defaultSelectAll={false}
      />
      <div className="masonry-container">
        <XMasonry center={false} targetBlockWidth={300}>
          {displayedContracts.map((contract) => (
            <XBlock key={contract.template.id}>
              <ContractCard contract={contract} />
            </XBlock>
          ))}
        </XMasonry>
      </div>
    </MainLayout>
  );
};

export default TrendingContracts;
