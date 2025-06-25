import React, { useState } from "react";
import "./contract-template-card.scss";
import { AbiAction, ContractTemplate } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";
import { Button, Card, Drawer, Image, Tooltip } from "antd";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import AbiForm from "../abi-form";
import Paragraph from "antd/es/typography/Paragraph";

const ContractTemplateCard: React.FC<{
  contractTemplate: ContractTemplate;
  onDeleteTemplate: (id: string) => void;
  onEditTemplate: (id: string) => void;
}> = ({ contractTemplate, onDeleteTemplate, onEditTemplate }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [openDeploy, setOpenDeploy] = useState<boolean>(false);

  const openText = (text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <>
      <Card
        hoverable
        className="contract-template-card"
        actions={[
          <Tooltip title="Deploy" arrow={false}>
            <CloudUploadOutlined onClick={() => setOpenDeploy(true)} />
          </Tooltip>,
          <Tooltip title="Edit" arrow={false}>
            <EditOutlined onClick={() => onEditTemplate(contractTemplate.id)} />
          </Tooltip>,
          <Tooltip title="Delete" arrow={false}>
            <DeleteOutlined
              onClick={() => onDeleteTemplate(contractTemplate.id)}
            />
          </Tooltip>,
        ]}
      >
        <span className="template-name">
          {contractTemplate.name}
          {Array.from(
            new Map(
              blockchains
                .filter(
                  (blockchain) =>
                    contractTemplate.networkClusters.includes(
                      blockchain.networkCluster
                    ) && !blockchain.isTestnet
                )
                .map((blockchain) => [blockchain.logo, blockchain])
            ).values()
          ).map((blockchain) => (
            <Tooltip title={blockchain.name} arrow={false}>
              <Image
                key={blockchain.id}
                src={blockchain.logo}
                preview={false}
                className="template-chain"
              />
            </Tooltip>
          ))}
        </span>
        <div className="template-component">
          {[
            { label: "ABI", value: JSON.stringify(contractTemplate.abi) },
            { label: "Bytecode", value: contractTemplate.bytecode },
            { label: "Flatten Source", value: contractTemplate.flattenSource },
          ].map(({ label, value }) => (
            <div>
              <Paragraph copyable={{ text: value, tooltips: false }}>
                <Button type="link" onClick={() => openText(value)}>
                  {label}
                </Button>
              </Paragraph>
            </div>
          ))}
        </div>
      </Card>
      <Drawer
        width={700}
        title={contractTemplate.name}
        open={openDeploy}
        closable={true}
        onClose={() => setOpenDeploy(false)}
      >
        <AbiForm
          defaultAction={AbiAction.Deploy}
          contractTemplate={contractTemplate}
        />
      </Drawer>
    </>
  );
};

export default ContractTemplateCard;
