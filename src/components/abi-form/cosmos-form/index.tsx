import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import React from "react";

const CosmosForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({}) => {
  return <div>Available soon</div>;
};

export default CosmosForm;
