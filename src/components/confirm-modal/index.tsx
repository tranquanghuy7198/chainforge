import { Button, Flex, Image, Modal } from "antd";
import React from "react";
import "./confirm-modal.scss";

import ErrorIcon from "../../assets/ic_error.png";
import InfoIcon from "../../assets/ic_info.png";

const ConfirmModal: React.FC<{
  showModal: boolean;
  danger?: boolean;
  showButtons?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title: string;
  okText?: string;
  description: string;
}> = ({
  showModal,
  danger = false,
  showButtons = true,
  onOk = () => {},
  onCancel = () => {},
  title,
  okText = "OK",
  description,
}) => {
  return (
    <Modal
      centered
      open={showModal}
      footer={null}
      onCancel={onCancel}
      width={350}
    >
      <Flex vertical align="center" justify="stretch" gap={12}>
        <Image
          src={danger ? ErrorIcon : InfoIcon}
          className="confirm-icon"
          preview={false}
        />
        <div className="confirm-title">{title}</div>
        <div className="confirm-des">{description}</div>
        {showButtons && (
          <Button
            type="primary"
            block
            danger={danger}
            onClick={() => {
              onOk(); // Do action
              onCancel(); // Close the modal
            }}
          >
            {okText}
          </Button>
        )}
        {showButtons && (
          <Button block onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Flex>
    </Modal>
  );
};

export default ConfirmModal;
