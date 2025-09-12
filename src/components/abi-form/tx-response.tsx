import { Alert, Button, Space } from "antd";
import React, { useEffect, useState } from "react";
import { Blockchain, TX_PATTERN, TxResponse } from "@utils/constants";
import { useAuth } from "@hooks/auth";
import { checkWalletStatus, linkWallet, requestChallenge } from "@api/auth";
import { shorten } from "@utils/utils";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import "./abi-form.scss";

const TransactionResult: React.FC<{
  blockchain?: Blockchain;
  wallet: Wallet;
  txResponse: TxResponse;
}> = ({ blockchain, wallet, txResponse }) => {
  const [notification, contextHolder] = useNotification();
  const { callAuthenticatedApi } = useAuth();
  const [linked, setLinked] = useState<boolean>(true);

  useEffect(() => {
    // If we cannot detect wallet, do not bother users
    if (!wallet.address) {
      setLinked(true);
      return;
    }

    // Check wallet linking status
    callAuthenticatedApi(
      checkWalletStatus,
      wallet.address,
      wallet.networkCluster
    ).then((linkStatus) => {
      if (linkStatus !== null) setLinked(linkStatus);
      else setLinked(true); // If we cannot detect linking status, do not bother users
    });
  }, [txResponse]);

  const link = async () => {
    try {
      await wallet.connect();
      if (!wallet.address)
        throw new Error(`Cannot connect to ${wallet.ui.name} wallet`);
      const [timestamp, nonce, challenge] = await requestChallenge(
        wallet.address
      );
      const signature = await wallet.signMessage(challenge);
      await callAuthenticatedApi(
        linkWallet,
        wallet.address,
        timestamp,
        nonce,
        signature,
        wallet.networkCluster
      );
      setLinked(false);
    } catch (error) {
      notification.error({
        message: "Cannot connect wallet",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <Space direction="vertical" className="tx-response">
      {contextHolder}
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
      {wallet.address && !linked && (
        <Alert
          showIcon
          type="warning"
          message={`Wallet ${shorten(
            wallet.address
          )} is not connected to your account.`}
          action={
            <Button size="small" type="text" onClick={link}>
              LINK
            </Button>
          }
        />
      )}
    </Space>
  );
};

export default TransactionResult;
