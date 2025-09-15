import { Button, Image, Space, Typography } from "antd";
import React from "react";
import { shorten } from "@utils/utils";
import { ADDRESS_PATTERN, Blockchain } from "@utils/constants";
import { CheckOutlined, CopyOutlined, ExportOutlined } from "@ant-design/icons";
import "./abi-form.scss";

const AbiTitle: React.FC<{
  name: string;
  address: string;
  blockchain?: Blockchain;
}> = ({ name, address, blockchain }) => {
  return (
    <Space>
      {name}
      <Image
        preview={false}
        className="contract-chain"
        src={blockchain?.logo}
      />
      <a
        href={blockchain?.addressUrl?.replaceAll(ADDRESS_PATTERN, address)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {shorten(address)} <ExportOutlined />
      </a>
      <Typography.Text
        copyable={{
          text: address,
          icon: [
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined className="copy-address" />}
            />,
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined className="copy-done" />}
            />,
          ],
        }}
      />
    </Space>
  );
};

export default AbiTitle;
