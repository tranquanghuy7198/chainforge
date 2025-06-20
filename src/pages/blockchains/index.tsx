import "./blockchains.scss";

import React, { useEffect, useState } from "react";
import BlockchainCard from "../../components/chain-card";
import { Content } from "antd/es/layout/layout";
import { Input, Select } from "antd";
import { Blockchain } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";

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
      <div className="page-header">
        <h1 className="page-title">Blockchains</h1>
        <div className="page-filter">
          <Select
            defaultValue={[MAINNET, TESTNET]}
            className="page-select"
            mode="multiple"
            options={[
              { value: MAINNET, label: "Mainnet" },
              { value: TESTNET, label: "Testnet" },
            ]}
            onChange={(values: string[]) => setSelectedValues(values)}
          />
          <Input.Search
            placeholder="Search blockchains"
            onSearch={(value) => setSearchedValue(value)}
            className="page-search"
          />
        </div>
      </div>
      <Content className="item-dashboard">
        {displayedBlockchains.map((blockchain) => (
          <BlockchainCard blockchain={blockchain} />
        ))}
      </Content>
    </div>
  );
};

export default Blockchains;
