import React, { useState } from "react";
import { AbiAction, DeployedContract } from "../../utils/constants";
import { Card, Drawer, Image, Tooltip } from "antd";
import { useAppSelector } from "../../redux/hook";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  QuestionCircleFilled,
} from "@ant-design/icons";
import "./contract-card.scss";
import { shorten } from "../../utils/utils";
import AbiForm from "../abi-form";

const ContractCard: React.FC<{ contract: DeployedContract }> = ({
  contract,
}) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [contractAction, setContractAction] = useState<AbiAction>();

  return (
    <>
      <Card
        hoverable
        className="contract-card"
        actions={[
          <Tooltip title="Read Contract" arrow={false}>
            <EyeOutlined onClick={() => setContractAction(AbiAction.Read)} />
          </Tooltip>,
          <Tooltip title="Write Contract" arrow={false}>
            <EditOutlined onClick={() => setContractAction(AbiAction.Write)} />
          </Tooltip>,
          <Tooltip title="Delete" arrow={false}>
            <DeleteOutlined />
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
              <div className="contract-address">
                <Tooltip
                  title={blockchain?.name ?? "Unknown blockchain"}
                  arrow={false}
                >
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
        title={contract.template.name}
        open={contractAction !== undefined}
        closable={true}
        onClose={() => setContractAction(undefined)}
      >
        <AbiForm
          action={contractAction ?? AbiAction.Deploy}
          contractTemplate={contract.template}
        />
      </Drawer>
    </>
  );
};

export default ContractCard;
