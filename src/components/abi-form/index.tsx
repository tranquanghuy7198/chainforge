import React from "react";
import "./abi-form.scss";
import {
  AbiAction,
  ContractTemplate,
  NetworkCluster,
} from "../../utils/constants";
import EvmForm from "./evm-form";
import SuiForm from "./sui-form";

const AbiForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
}> = ({ action, contractTemplate }) => {
  if (contractTemplate.networkClusters.includes(NetworkCluster.Sui))
    return <SuiForm action={action} abi={contractTemplate.abi} />;
  else if (contractTemplate.networkClusters.includes(NetworkCluster.Solana))
    return <>Available soon</>;
  else if (contractTemplate.networkClusters.includes(NetworkCluster.Cosmos))
    return <>Available soon</>;
  else if (contractTemplate.networkClusters.includes(NetworkCluster.FlowChain))
    return <>Available soon</>;
  else return <EvmForm action={action} contractTemplate={contractTemplate} />;
};

export default AbiForm;
