import { Drawer } from "antd";
import React from "react";
import AbiTitle from "../abi-title";
import {
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "../../../utils/constants";
import { Wallet } from "../../../utils/wallets/wallet";
import { IdlInstruction } from "../../../utils/types/solana";

const SolanaFullInstructionForm: React.FC<{
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction: IdlInstruction;
  writeFull: boolean;
  setWriteFull: () => void;
}> = ({
  contractAddress,
  wallet,
  blockchain,
  instruction,
  writeFull,
  setWriteFull,
}) => {
  return (
    <Drawer
      width={1000}
      closable={true}
      title={
        <AbiTitle
          name={instruction.name}
          address={contractAddress?.address ?? ""}
          blockchain={blockchain}
        />
      }
      open={writeFull}
      onClose={() => setWriteFull()}
    ></Drawer>
  );
};

export default SolanaFullInstructionForm;
