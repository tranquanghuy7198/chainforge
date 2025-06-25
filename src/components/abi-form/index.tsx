import React from "react";
import "./abi-form.scss";
import {
  AbiAction,
  Blockchain,
  ContractTemplate,
  NetworkCluster,
} from "../../utils/constants";
import EvmForm from "./evm-form";
import SuiForm from "./sui-form";
import { Wallet } from "../../utils/wallets/wallet";

const AbiForm: React.FC<{
  fixedWallet?: Wallet;
  fixedBlockchain?: Blockchain;
  action: AbiAction;
  contractTemplate: ContractTemplate;
}> = ({ fixedWallet, fixedBlockchain, action, contractTemplate }) => {
  if (contractTemplate.networkClusters.includes(NetworkCluster.Sui))
    return <SuiForm action={action} abi={contractTemplate.abi} />;
  else if (contractTemplate.networkClusters.includes(NetworkCluster.Solana))
    return <>Available soon</>;
  else if (contractTemplate.networkClusters.includes(NetworkCluster.Cosmos))
    return <>Available soon</>;
  else if (contractTemplate.networkClusters.includes(NetworkCluster.FlowChain))
    return <>Available soon</>;
  else
    return (
      <EvmForm
        fixedWallet={fixedWallet}
        fixedBlockchain={fixedBlockchain}
        action={action}
        contractTemplate={contractTemplate}
      />
    );
};

export default AbiForm;
