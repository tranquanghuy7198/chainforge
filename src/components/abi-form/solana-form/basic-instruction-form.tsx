import React, { useState } from "react";
import SolanaInstructionForm from "./instruction-form";
import { Button } from "antd";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  TxResponse,
} from "../../../utils/constants";
import { Wallet } from "../../../utils/wallets/wallet";
import { IdlInstruction } from "../../../utils/types/solana";
import {
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { capitalize } from "../../../utils/utils";
import TransactionResult from "../tx-response";

const SolanaBasicInstructionForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
}> = ({
  action,
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [txResp, setTxResp] = useState<TxResponse>();

  return (
    <>
      <SolanaInstructionForm
        contractTemplate={contractTemplate}
        contractAddress={contractAddress}
        wallet={wallet}
        blockchain={blockchain}
        instruction={instruction}
        disabled={loading}
      />
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        icon={
          action === AbiAction.Deploy ? (
            <CloudUploadOutlined />
          ) : action === AbiAction.Read ? (
            <EyeOutlined />
          ) : (
            <EditOutlined />
          )
        }
      >
        {capitalize(action.toString())}
      </Button>
      {txResp && <TransactionResult txResponse={txResp} />}
    </>
  );
};

export default SolanaBasicInstructionForm;
