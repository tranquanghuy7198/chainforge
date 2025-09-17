import React, { useEffect, useState } from "react";
import { AbiAction, ContractAddress, DeployedContract } from "@utils/constants";
import { Card, Drawer, Flex, Image, Space, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  QuestionCircleFilled,
} from "@ant-design/icons";
import "@components/contract-card/contract-card.scss";
import { compareAddr, shorten } from "@utils/utils";
import AbiForm from "@components/abi-form";
import AbiTitle from "@components/abi-form/abi-title";
import Paragraph from "antd/es/typography/Paragraph";
import { useFetchBlockchains } from "@hooks/blockchain";
import { useSearchParams } from "react-router-dom";

const ContractCard: React.FC<{
  contract: DeployedContract;
  onDeleteContract?: (templateId: string) => void;
  onEditContract?: (templateId: string) => void;
}> = ({ contract, onDeleteContract, onEditContract }) => {
  const { blockchains } = useFetchBlockchains();
  const [contractAddress, setContractAddress] = useState<ContractAddress>();
  const [params] = useSearchParams();

  useEffect(() => {
    const templateIdParam = params.get("templateId");
    const blockchainIdParam = params.get("blockchainId");
    const addressParam = params.get("address") || "";
    if (templateIdParam === contract.template.id)
      setContractAddress(
        contract.addresses.find(
          (address) =>
            address.blockchainId === blockchainIdParam &&
            compareAddr(
              address.address,
              addressParam,
              blockchains.find((chain) => chain.id === blockchainIdParam)
                ?.networkCluster
            )
        )
      );
  }, [params, contract]);

  const actions: React.ReactNode[] = [];
  if (onEditContract)
    actions.push(
      <Tooltip title="Edit">
        <EditOutlined onClick={() => onEditContract(contract.template.id)} />
      </Tooltip>
    );
  if (onDeleteContract)
    actions.push(
      <Tooltip title="Delete">
        <DeleteOutlined
          onClick={() => onDeleteContract(contract.template.id)}
        />
      </Tooltip>
    );

  return (
    <>
      <Card className="masonry-item" hoverable actions={actions}>
        <Flex vertical justify="stretch" gap={5}>
          <div className="contract-name">{contract.template.name}</div>
          {contract.template.description && (
            <Paragraph
              className="description"
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
