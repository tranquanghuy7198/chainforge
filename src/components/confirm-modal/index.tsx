import { Button, Image, Modal } from "antd";
import React from "react";
import "./confirm-modal.scss";

import ErrorIcon from "../../images/ic_error.png";
import InfoIcon from "../../images/ic_info.png";

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
      width={450}
      bodyStyle={{
        display: "flex",
        flexFlow: "column",
        alignItems: "center",
        padding: 32,
      }}
    >
      <Image
        src={danger ? ErrorIcon : InfoIcon}
        className="confirm-icon"
        preview={false}
      />
      <div className="confirm-title">{title}</div>
      <div className="confirm-des">{description}</div>
      {showButtons && (
        <div className="confirm-btn-container">
          <Button
            type="primary"
            block
            className="confirm-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <div className="confirm-btn-space" />
          <Button
            type="primary"
            block
            danger={danger}
            onClick={() => {
              onOk();
              onCancel();
            }}
          >
            {okText}
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmModal;
