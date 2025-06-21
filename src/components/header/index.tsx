import { Button, Input, Select } from "antd";
import React from "react";
import "./header.scss";

const Header: React.FC<{
  header: string;
  options: { value: string; label: string }[];
  onSelected: (selectedValues: string[]) => void;
  onSearched: (value: string) => void;
  onAddRequested: () => void;
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
      <h1 className="page-title">{header}</h1>
      <div className="page-filter">
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
          placeholder="Search blockchains"
          onSearch={(value) => onSearched(value)}
          className="page-search"
          allowClear
        />
        <Button type="primary" shape="round" onClick={() => onAddRequested()}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default Header;
