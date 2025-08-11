import { Alert } from "antd";
import React from "react";
import { Blockchain, TxResponse } from "../../utils/constants";
import "./abi-form.scss";

const TransactionResult: React.FC<{
  blockchain?: Blockchain;
  txResponse: TxResponse;
}> = ({ blockchain, txResponse }) => {
  return (
    <Alert
      type="info"
      className="tx-response"
      message={
        txResponse.data ??
        (txResponse.txHash && blockchain ? (
          <a
            target="_blank"
            href={blockchain.txUrl.replace("[[tx]]", txResponse.txHash)}
          >
            {txResponse.txHash}
          </a>
        ) : (
          ""
        ))
      }
    />
  );
};

export default TransactionResult;
