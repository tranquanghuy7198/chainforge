import { Image, Space } from "antd";
import React from "react";
import { shorten } from "@utils/utils";
import { ADDRESS_PATTERN, Blockchain } from "@utils/constants";
import { ExportOutlined } from "@ant-design/icons";

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
    </Space>
  );
};

export default AbiTitle;
