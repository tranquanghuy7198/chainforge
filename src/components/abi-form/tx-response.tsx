import { Descriptions } from "antd";
import React from "react";
import { TxResponse } from "../../utils/constants";
import { capitalize } from "../../utils/utils";

const TransactionResult: React.FC<{ txResponse: TxResponse }> = ({
  txResponse,
}) => {
  return (
    <Descriptions
      bordered
      size="small"
      items={Object.entries(txResponse).map(([key, value]) => ({
        key,
        label: capitalize(key),
        children: value,
      }))}
    />
  );
};

export default TransactionResult;
