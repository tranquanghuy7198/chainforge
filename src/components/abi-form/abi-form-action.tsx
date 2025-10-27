import { AbiAction, CopyStatus, NetworkCluster } from "@utils/constants";
import { capitalize } from "@utils/utils";
import {
  BulbFilled,
  CheckOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Flex, FormInstance, Space, Tooltip } from "antd";
import React from "react";
import { DocType, docUrl } from "@docs/index";
import "./abi-form.scss";

const AbiFormAction: React.FC<{
  action: AbiAction;
  networkCluster: NetworkCluster;
  loading: boolean;
  copying: CopyStatus;
  form?: FormInstance;
  execute?: () => Promise<void>;
  copyTxBytecode: () => Promise<void>;
}> = ({
  action,
  networkCluster,
  loading,
  copying,
  form,
  execute,
  copyTxBytecode,
}) => {
  const executeAbiForm = async () => {
    if (form) form.submit();
    else if (execute) await execute();
  };

  return (
    <Flex justify="space-between" align="center">
      <Space>
        <Button
          type="primary"
          onClick={executeAbiForm}
          loading={loading}
          icon={
            action === AbiAction.Deploy ? (
              <CloudUploadOutlined />
            ) : action === AbiAction.Read ? (
              <EyeOutlined />
            ) : (
              <EditOutlined />
            )
          }
        >
          {capitalize(action.toString())}
        </Button>
        {action === AbiAction.Write && (
          <Button
            variant="filled"
            color="default"
            icon={<CopyOutlined />}
            iconPosition="end"
            loading={
              (copying === "copying" && {
                icon: <LoadingOutlined />,
              }) ||
              (copying === "copied" && {
                icon: <CheckOutlined className="copy-done" />,
              })
            }
            onClick={copyTxBytecode}
          >
            Copy bytecode
          </Button>
        )}
      </Space>
      <Tooltip title={`${capitalize(networkCluster)} Interaction Help`}>
        <Button
          type="text"
          shape="circle"
          size="small"
          icon={<BulbFilled className="abi-form-doc" />}
          onClick={() =>
            window.open(docUrl(networkCluster, DocType.CallContract))
          }
        />
      </Tooltip>
    </Flex>
  );
};

export default AbiFormAction;
