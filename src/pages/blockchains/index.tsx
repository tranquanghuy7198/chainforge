import "./blockchains.scss";

import React, { useEffect, useState } from "react";
import BlockchainCard from "../../components/chain-card";
import { Blockchain } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";
import Header from "../../components/header";
import { Button, Checkbox, Drawer, Form, Input } from "antd";
import { BlockchainForm, requestNewBlockchain } from "../../api/discord";
import useNotification from "antd/es/notification/useNotification";
import { XBlock, XMasonry } from "react-xmasonry";

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
  const [addBlockchain, setAddBlockchain] = useState<boolean>(false);
  const [notification, contextHolder] = useNotification();

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

  const requestChain = async (values: BlockchainForm) => {
    await requestNewBlockchain(values);
    notification.success({
      message: "Request submmited",
      description: `Thank you for your request. We will support ${values.name} as soon as possible.`,
    });
  };

  return (
    <div className="page">
      {contextHolder}
      <Header
        header="Blockchains"
        options={[
          { value: MAINNET, label: "Mainnet" },
          { value: TESTNET, label: "Testnet" },
        ]}
        onSelected={setSelectedValues}
        onSearched={setSearchedValue}
        onAddRequested={() => setAddBlockchain(true)}
        defaultSelectAll
      />
      <div className="masonry-container">
        <XMasonry center={false} targetBlockWidth={360}>
          {displayedBlockchains.map((blockchain) => (
            <XBlock key={blockchain.id}>
              <BlockchainCard blockchain={blockchain} />
            </XBlock>
          ))}
        </XMasonry>
      </div>
      <Drawer
        width={500}
        title="Request New Blockchain"
        open={addBlockchain}
        closable={true}
        onClose={() => setAddBlockchain(false)}
      >
        <Form
          name="add-blockchain"
          layout="horizontal"
          onFinish={(values) => requestChain(values)}
        >
          <Form.Item name="name" label="Name" required>
            <Input placeholder="Blockchain Name" />
          </Form.Item>
          <Form.Item name="referenceLink" label="Reference Link" required>
            <Input placeholder="Reference Link" />
          </Form.Item>
          <Form.Item
            name="isTestnet"
            label="Testnet"
            valuePropName="checked"
            required
          >
            <Checkbox />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Request
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Blockchains;
