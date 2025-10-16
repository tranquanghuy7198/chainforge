import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import React from "react";

const AptosForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({ action, contractTemplate, contractAddress, wallet, blockchain }) => {
  return <>TODO</>;
};

export default AptosForm;
