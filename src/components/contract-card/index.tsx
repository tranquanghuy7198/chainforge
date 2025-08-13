import React, { useState } from "react";
import { AbiAction, ContractAddress, DeployedContract } from "@utils/constants";
import { Card, Drawer, Flex, Image, Space, Tooltip } from "antd";
import { useAppSelector } from "@redux/hook";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  QuestionCircleFilled,
} from "@ant-design/icons";
import "@components/contract-card/contract-card.scss";
import { shorten } from "@utils/utils";
import AbiForm from "@components/abi-form";
import AbiTitle from "@components/abi-form/abi-title";
import Paragraph from "antd/es/typography/Paragraph";

const ContractCard: React.FC<{
  contract: DeployedContract;
  onDeleteContract: (id: string) => void;
  onEditContract: (id: string) => void;
}> = ({ contract, onDeleteContract, onEditContract }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [contractAddress, setContractAddress] = useState<ContractAddress>();

  return (
    <>
      <Card
        className="masonry-item"
        hoverable
        actions={[
          <Tooltip title="Edit">
            <EditOutlined onClick={() => onEditContract(contract.id)} />
          </Tooltip>,
          <Tooltip title="Delete">
            <DeleteOutlined onClick={() => onDeleteContract(contract.id)} />
          </Tooltip>,
        ]}
      >
        <Flex vertical justify="stretch" gap={5}>
          <div className="contract-name">{contract.template.name}</div>
          {contract.template.description && (
            <Paragraph
              className="primary-description"
              ellipsis={{ rows: 4, expandable: true, symbol: "See more" }}
            >
              {contract.template.description}
            </Paragraph>
          )}
          <div>
            {contract.addresses.map((address) => {
              const blockchain = blockchains.find(
                (chain) => chain.id === address.blockchainId
              );
              return (
                <Space
                  key={`${address.blockchainId}-${address.address}`}
                  className="contract-address"
                  onClick={() => setContractAddress(address)}
                >
                  <Tooltip title={blockchain?.name ?? "Unknown blockchain"}>
                    {blockchain ? (
                      <Image
                        src={blockchain.logo}
                        preview={false}
                        className="contract-chain"
                      />
                    ) : (
                      <QuestionCircleFilled />
                    )}
                  </Tooltip>
                  <a>
                    {shorten(address.address)} <ExportOutlined />
                  </a>
                </Space>
              );
            })}
          </div>
        </Flex>
      </Card>
      <Drawer
        width={700}
        title={
          <AbiTitle
            name={contract.template.name}
            address={contractAddress?.address ?? ""}
            blockchain={blockchains.find(
              (chain) => chain.id === contractAddress?.blockchainId
            )}
          />
        }
        open={contractAddress !== undefined}
        closable={true}
        onClose={() => setContractAddress(undefined)}
      >
        <AbiForm
          contractAddress={contractAddress}
          defaultAction={AbiAction.Read}
          contractTemplate={contract.template}
        />
      </Drawer>
    </>
  );
};

export default ContractCard;
