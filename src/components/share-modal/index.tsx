import { Button, Flex, Modal } from "antd";
import React from "react";
import {
  FacebookFilled,
  LinkedinFilled,
  LinkOutlined,
  XOutlined,
} from "@ant-design/icons";
import "./share-modal.scss";
import useMessage from "antd/es/message/useMessage";

const ShareModel: React.FC<{
  shareableUrl: string;
  showModal: boolean;
  onHide: () => void;
}> = ({ shareableUrl, showModal, onHide }) => {
  const [message, contextHolder] = useMessage();

  const shareToX = async () => {
    //
  };

  const shareToFacebook = async () => {
    //
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    message.success("Copied to clipboard");
  };

  const shareablePlatforms = [
    {
      icon: <XOutlined />,
      onClick: shareToX,
    },
    {
      icon: <FacebookFilled />,
      onClick: shareToFacebook,
    },
    {
      icon: <LinkedinFilled />,
      onClick: shareToX,
    },
    {
      icon: <LinkedinFilled />,
      onClick: shareToX,
    },
    {
      icon: <LinkedinFilled />,
      onClick: shareToX,
    },
  ];

  return (
    <Modal
      centered
      open={showModal}
      footer={null}
      onCancel={onHide}
      width={350}
    >
      {contextHolder}
      <Flex vertical gap={20} justify="stretch">
        <Flex vertical align="center" gap={5}>
          <div className="primary-title">Share Contract</div>
          <Flex vertical align="center" className="description">
            <div>Make this contract publicly accessible</div>
            <div>Allow everyone to see and interact on-chain</div>
          </Flex>
        </Flex>
        <Flex vertical gap={5}>
          <div>Share link via</div>
          <Flex justify="space-between">
            {shareablePlatforms.map(({ icon, onClick }) => (
              <Button
                color="default"
                type="text"
                variant="filled"
                size="large"
                icon={icon}
                onClick={onClick}
                className="share-platform"
              />
            ))}
          </Flex>
        </Flex>
        <Flex vertical gap={5}>
          <div>Page direct</div>
          <Button
            color="default"
            type="text"
            variant="filled"
            size="large"
            icon={<LinkOutlined />}
            onClick={copyLink}
          >
            Copy Link
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ShareModel;
