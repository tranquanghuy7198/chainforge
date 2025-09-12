import { Alert, Button, Space } from "antd";
import React, { useEffect } from "react";
import { Blockchain, TX_PATTERN, TxResponse } from "@utils/constants";
import { useAuth } from "@hooks/auth";
import { checkWalletStatus } from "@api/auth";
import { shorten } from "@utils/utils";
import "./abi-form.scss";

const TransactionResult: React.FC<{
  blockchain?: Blockchain;
  txResponse: TxResponse;
}> = ({ blockchain, txResponse }) => {
  const { callAuthenticatedApi } = useAuth();
  const [linked, setLinked] = React.useState<boolean>(false);

  useEffect(() => {
    callAuthenticatedApi(
      checkWalletStatus,
      txResponse.walletAddress,
      txResponse.networkCluster
    ).then((linkStatus) => {
      if (linkStatus !== null) setLinked(linkStatus);
      else setLinked(true); // If cannot detect linking status, do not bother users
    });
  }, [txResponse]);

  return (
    <Space direction="vertical" className="tx-response">
      <Alert
        type="info"
        className="tx-response"
        message={
          txResponse.data ??
          (txResponse.txHash && blockchain ? (
            <a
              target="_blank"
              href={blockchain.txUrl.replaceAll(TX_PATTERN, txResponse.txHash)}
            >
              {txResponse.txHash}
            </a>
          ) : (
            ""
          ))
        }
      />
      {!linked && (
        <Alert
          showIcon
          type="warning"
          message={`Wallet ${shorten(
            txResponse.walletAddress
          )} is not connected to your account.`}
          action={
            <Button size="small" type="text">
              LINK
            </Button>
          }
        />
      )}
    </Space>
  );
};

export default TransactionResult;
