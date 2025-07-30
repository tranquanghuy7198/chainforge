import { Image, Space } from "antd";
import React from "react";
import "./select-option.scss";

const SelectOption: React.FC<{ icon: string; label: string }> = ({
  icon,
  label,
}) => {
  return (
    <Space align="baseline">
      <Image src={icon} className="select-icon" preview={false} />
      <div>{label}</div>
    </Space>
  );
};

export default SelectOption;
