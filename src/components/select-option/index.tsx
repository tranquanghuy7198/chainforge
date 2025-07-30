import { Image, Space } from "antd";
import React from "react";
import "./select-option.scss";

const SelectOption: React.FC<{ icon: string; label: React.ReactNode }> = ({
  icon,
  label,
}) => {
  return (
    <Space align="center">
      <Image src={icon} className="select-icon" preview={false} />
      <div>{label}</div>
    </Space>
  );
};

export default SelectOption;
