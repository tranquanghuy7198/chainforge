import "./blockchains.scss";

import React, { useEffect, useState } from "react";
import BlockchainCard from "../../components/chain-card";
import { Content } from "antd/es/layout/layout";
import { Blockchain } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";
import Header from "../../components/header";

const TESTNET: string = "testnet";
const MAINNET: string = "mainnet";

const Blockchains: React.FC = () => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [displayedBlockchains, setDisplayedBlockchains] = useState<
    Blockchain[]
  >([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([
    MAINNET,
    TESTNET,
  ]);
  const [searchedValue, setSearchedValue] = useState<string>();

  useEffect(() => {
    setDisplayedBlockchains(
      blockchains.filter((chain) => {
        if (
          searchedValue &&
          !chain.name.toLowerCase().includes(searchedValue.toLowerCase())
        )
          return false;
        if (!selectedValues.includes(chain.isTestnet ? TESTNET : MAINNET))
          return false;
        return true;
      })
    );
  }, [blockchains, selectedValues, searchedValue]);

  return (
    <div className="page">
      <Header
        header="Blockchains"
        options={[
          { value: MAINNET, label: "Mainnet" },
          { value: TESTNET, label: "Testnet" },
        ]}
        onSelected={setSelectedValues}
        onSearched={setSearchedValue}
        onAddRequested={() => {}}
        defaultSelectAll
      />
      <Content className="item-dashboard">
        {displayedBlockchains.map((blockchain) => (
          <BlockchainCard key={blockchain.id} blockchain={blockchain} />
        ))}
      </Content>
    </div>
  );
};

export default Blockchains;
