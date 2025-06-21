import { Input, Select } from "antd";
import React from "react";
import "./header.scss";

const Header: React.FC<{
  header: string;
  options: { value: string; label: string }[];
  onSelected: (selectedValues: string[]) => void;
  onSearched: (value: string) => void;
  defaultSelectAll: boolean;
}> = ({ header, options, onSelected, onSearched, defaultSelectAll }) => {
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
        />
        <Input.Search
          placeholder="Search blockchains"
          onSearch={(value) => onSearched(value)}
          className="page-search"
        />
      </div>
    </div>
  );
};

export default Header;
