import { Button, Flex, Modal } from "antd";
import React from "react";
import {
  FacebookFilled,
  LinkedinFilled,
  LinkOutlined,
  RedditCircleFilled,
  XOutlined,
} from "@ant-design/icons";
import "./share-modal.scss";
import useMessage from "antd/es/message/useMessage";

const ShareModal: React.FC<{
  shareableUrl: string;
  showModal: boolean;
  onHide: () => void;
}> = ({ shareableUrl, showModal, onHide }) => {
  const [message, contextHolder] = useMessage();

  const shareToX = async () => {
    const text = encodeURIComponent(
      "🚀 Discover trending smart contract templates on our Web3 platform! Explore, deploy, and share seamlessly. #Web3 #Blockchain #SmartContracts #DeFi"
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        shareableUrl
      )}`,
      "_blank"
    );
  };

  const shareToReddit = async () => {
    message.info("Available soon...");
    // const shareUrl = new URL("https://www.reddit.com/submit");
    // shareUrl.searchParams.set("url", shareableUrl);
    // shareUrl.searchParams.set(
    //   "title",
    //   "🚀 Discover trending smart contract templates on our Web3 platform!"
    // );
    // window.open(shareUrl.toString(), "_blank", "width=800,height=600");
  };

  const shareToFacebook = async () => {
    const shareUrl = new URL("https://www.facebook.com/sharer.php");
    shareUrl.searchParams.set("u", shareableUrl);
    shareUrl.searchParams.set(
      "quote",
      "🚀 Discover trending smart contract templates on our Web3 platform!"
    );
    window.open(shareUrl.toString(), "_blank");
  };

  const shareToLinkedin = async () => {
    message.info("Available soon...");
    // window.open(
    //   "https://www.linkedin.com/sharing/share-offsite/?url=" +
    //     encodeURIComponent(shareableUrl),
    //   "_blank"
    // );
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
      icon: <RedditCircleFilled />,
      onClick: shareToReddit,
    },
    {
      icon: <FacebookFilled />,
      onClick: shareToFacebook,
    },
    {
      icon: <LinkedinFilled />,
      onClick: shareToLinkedin,
    },
    {
      icon: <LinkedinFilled />,
      onClick: shareToLinkedin,
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
            {shareablePlatforms.map(({ icon, onClick }, index) => (
              <Button
                key={index}
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

export default ShareModal;
