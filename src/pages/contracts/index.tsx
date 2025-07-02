import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import {
  CONTRACT_KEY,
  DeployedContract,
  NetworkCluster,
} from "../../utils/constants";
import ContractCard from "../../components/contract-card";
import useLocalStorageState from "use-local-storage-state";
import { capitalize } from "../../utils/utils";
import { useAppSelector } from "../../redux/hook";
import { Drawer } from "antd";
import ContractForm, {
  ContractFormStructure,
  parseContractForm,
} from "../../components/contract-form";
import useNotification from "antd/es/notification/useNotification";
import Paragraph from "antd/es/typography/Paragraph";
import { Masonry } from "masonic";

const Contracts: React.FC = () => {
  const [notification, contextHolder] = useNotification();
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [contracts, setContracts] = useLocalStorageState<DeployedContract[]>(
    CONTRACT_KEY,
    { defaultValue: [] }
  );
  const [displayedContracts, setDisplayedContracts] = useState<
    DeployedContract[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();
  const [contractForm, setContractForm] = useState<{
    open: boolean;
    form?: ContractFormStructure;
  }>({ open: false, form: undefined });

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
  }, [contracts, blockchains, selectedClusters, searchedName]);

  const parseToContract = (
    contract: ContractFormStructure
  ): DeployedContract => {
    try {
      return parseContractForm(contract, blockchains, contractForm.form?.id);
    } catch (e) {
      notification.error({
        message: "Invalid data",
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {e instanceof Error ? e.message : String(e)}
          </Paragraph>
        ),
      });
      throw e;
    }
  };

  const saveContract = (contract: DeployedContract) => {
    setContracts(
      contracts.some((c) => c.id === contract.id)
        ? contracts.map((c) => (c.id === contract.id ? contract : c))
        : [...contracts, contract]
    );
    setContractForm({ open: false });
    notification.success({
      message: "Contract Saved",
      description: "A contract has been saved",
    });
  };

  const editContract = (id: string) => {
    const contract = contracts.find((c) => c.id === id);
    if (!contract) notification.error({ message: "Contract not found" });
    else
      setContractForm({
        open: true,
        form: {
          id: contract.id,
          name: contract.template.name,
          abi: JSON.stringify(contract.template.abi),
          flattenSource: contract.template.flattenSource,
          addresses: contract.addresses,
        },
      });
  };

  const deleteContract = (id: string) => {
    setContracts(contracts.filter((contract) => contract.id !== id));
  };

  return (
    <div className="page">
      {contextHolder}
      <Header
        header="Contracts"
        options={Object.values(NetworkCluster).map((cluster) => ({
          value: cluster.toString(),
          label: capitalize(cluster.toString()),
        }))}
        onSelected={setSelectedClusters}
        onSearched={setSearchedName}
        onAddRequested={() => setContractForm({ open: true, form: undefined })}
        defaultSelectAll={false}
      />
      <div className="masonry-container">
        <Masonry
          columnGutter={10}
          rowGutter={10}
          columnWidth={300}
          items={displayedContracts.map((contract) => ({
            contract: contract,
            onDeleteContract: deleteContract,
            onEditContract: editContract,
          }))}
          render={ContractCard}
        />
      </div>
      <Drawer
        width={700}
        title={contractForm.form ? contractForm.form.name : "Add Contract"}
        open={contractForm.open}
        closable={true}
        onClose={() => setContractForm({ ...contractForm, open: false })}
      >
        <ContractForm
          contractForm={contractForm}
          saveContract={(contract) => saveContract(parseToContract(contract))}
        />
      </Drawer>
    </div>
  );
};

export default Contracts;
