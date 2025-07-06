import React, { useState } from "react";
import {
  AbiAction,
  ADDRESS_PATTERN,
  ContractAddress,
  DeployedContract,
} from "../../utils/constants";
import { Card, Drawer, Image, Tooltip } from "antd";
import { useAppSelector } from "../../redux/hook";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  QuestionCircleFilled,
} from "@ant-design/icons";
import "./contract-card.scss";
import { shorten } from "../../utils/utils";
import AbiForm from "../abi-form";

const ContractCard: React.FC<{
  data: {
    contract: DeployedContract;
    onDeleteContract: (id: string) => void;
    onEditContract: (id: string) => void;
  };
}> = ({ data: { contract, onDeleteContract, onEditContract } }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [contractAddress, setContractAddress] = useState<ContractAddress>();

  return (
    <>
      <Card
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
        <div className="contract-name">{contract.template.name}</div>
        <div>
          {contract.addresses.map((address) => {
            const blockchain = blockchains.find(
              (chain) => chain.id === address.blockchainId
            );
            return (
              <div
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
              </div>
            );
          })}
        </div>
      </Card>
      <Drawer
        width={700}
        title={
          <div>
            {contract.template.name}{" "}
            <a
              href={blockchains
                .find((chain) => chain.id === contractAddress?.blockchainId)
                ?.addressUrl?.replaceAll(
                  ADDRESS_PATTERN,
                  contractAddress?.address || ""
                )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shorten(contractAddress?.address ?? "")} <ExportOutlined />
            </a>
          </div>
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
