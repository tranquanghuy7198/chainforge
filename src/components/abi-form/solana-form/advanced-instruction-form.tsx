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

const SolanaAdvancedInstructionForm: React.FC<{
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
  instruction?: IdlInstruction;
}> = ({
  contractTemplate,
  contractAddress,
  wallet,
  blockchain,
  instruction,
}) => {
  return <>ABC</>;
};

export default SolanaAdvancedInstructionForm;
