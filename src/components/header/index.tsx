import { Button, Input, Segmented, Select, Space } from "antd";
import React from "react";
import "./header.scss";
import {
  AppstoreOutlined,
  BarsOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

const Header: React.FC<{
  header: string;
  options: { value: string; label: string }[];
  onSelected: (selectedValues: string[]) => void;
  onSearched: (value: string) => void;
  onAddRequested?: () => void;
  defaultSelectAll: boolean;
}> = ({
  header,
  options,
  onSelected,
  onSearched,
  onAddRequested,
  defaultSelectAll,
}) => {
  return (
    <div className="page-header">
      <h2 className="page-title">{header}</h2>
      <Space>
        <Segmented<"list" | "masonry">
          defaultValue="masonry"
          options={[
            { value: "masonry", icon: <AppstoreOutlined /> },
            { value: "list", icon: <BarsOutlined /> },
          ]}
        />
        <Select
          defaultValue={
            defaultSelectAll ? options.map((option) => option.value) : []
          }
          className="page-select"
          mode="multiple"
          options={options}
          onChange={(values: string[]) => onSelected(values)}
          allowClear
          maxTagCount={"responsive"}
        />
        <Input.Search
          placeholder="Search"
          onSearch={(value) => onSearched(value)}
          className="page-search"
          allowClear
        />
        {onAddRequested && (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => onAddRequested()}
          >
            Add
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Header;
