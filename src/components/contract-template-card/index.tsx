import React, { useState } from "react";
import "./contract-template-card.scss";
import { AbiAction, ContractTemplate } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";
import { Card, Drawer, Image, Space, Tooltip } from "antd";
import {
  CloudUploadOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldBinaryOutlined,
  FileTextOutlined,
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

  return (
    <>
      <Card
        className="masonry-item"
        hoverable
        actions={[
          <Tooltip title="Deploy">
            <CloudUploadOutlined onClick={() => setOpenDeploy(true)} />
          </Tooltip>,
          <Tooltip title="Edit">
            <EditOutlined onClick={() => onEditTemplate(contractTemplate.id)} />
          </Tooltip>,
          <Tooltip title="Delete">
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
            <Tooltip key={blockchain.id} title={blockchain.name}>
              <Image
                src={blockchain.logo}
                preview={false}
                className="template-chain"
              />
            </Tooltip>
          ))}
        </span>
        <div className="template-component">
          {[
            {
              key: "abi",
              label: "ABI",
              value: JSON.stringify(contractTemplate.abi),
              icon: <FileTextOutlined className="template-icon" />,
            },
            {
              key: "bytecode",
              label: "Bytecode",
              value: contractTemplate.bytecode,
              icon: <FieldBinaryOutlined className="template-icon" />,
            },
            {
              key: "flattenSource",
              label: "Flatten Source",
              value: contractTemplate.flattenSource || "",
              icon: <CodeOutlined className="template-icon" />,
            },
          ].map(({ key, label, value, icon }) => (
            <div key={key}>
              <Paragraph copyable={{ text: value, tooltips: false }}>
                <Space>
                  {icon}
                  <a
                    href={URL.createObjectURL(
                      new Blob([value], { type: "text/plain" })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                </Space>
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
