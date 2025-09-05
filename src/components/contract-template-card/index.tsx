import React, { useState } from "react";
import "./contract-template-card.scss";
import { AbiAction, ContractTemplate } from "@utils/constants";
import { Avatar, Card, Drawer, Flex, Space, Tooltip } from "antd";
import {
  CloudUploadOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldBinaryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import AbiForm from "@components/abi-form";
import Paragraph from "antd/es/typography/Paragraph";
import { useFetchBlockchains } from "@hooks/blockchain";

const ContractTemplateCard: React.FC<{
  contractTemplate: ContractTemplate;
  onDeleteTemplate: (id: string) => void;
  onEditTemplate: (id: string) => void;
}> = ({ contractTemplate, onDeleteTemplate, onEditTemplate }) => {
  const { blockchains } = useFetchBlockchains();
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
        <Flex vertical gap={12}>
          <Flex align="center" justify="space-between">
            <div className="template-name">{contractTemplate.name}</div>
            <Avatar.Group
              size={30}
              max={{
                count: 4,
                style: {
                  color: "#0077ffff",
                  backgroundColor: "#c7e1ffff",
                  fontSize: 14,
                  fontWeight: "bold",
                },
              }}
            >
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
                  <Avatar src={blockchain.logo} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </Flex>
          <Flex vertical>
            {[
              {
                key: "abi",
                label: "ABI",
                value: JSON.stringify(contractTemplate.abi),
                icon: <FileTextOutlined />,
              },
              {
                key: "bytecode",
                label: "Bytecode",
                value: contractTemplate.bytecode,
                icon: <FieldBinaryOutlined />,
              },
              {
                key: "flattenSource",
                label: "Flatten Source",
                value: contractTemplate.flattenSource || "",
                icon: <CodeOutlined />,
              },
            ].map(({ key, label, value, icon }) => (
              <Paragraph key={key} copyable={{ text: value, tooltips: false }}>
                <Space>
                  <a
                    href={URL.createObjectURL(
                      new Blob([value], { type: "text/plain" })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {icon} {label}
                  </a>
                </Space>
              </Paragraph>
            ))}
          </Flex>
        </Flex>
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
