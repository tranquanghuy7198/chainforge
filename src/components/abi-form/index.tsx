import React from "react";
import "./abi-form.scss";
import {
  AbiAction,
  ContractAddress,
  ContractTemplate,
  NetworkCluster,
} from "../../utils/constants";
import EvmForm from "./evm-form";
import SuiForm from "./sui-form";

const AbiForm: React.FC<{
  contractAddress?: ContractAddress;
  action: AbiAction;
  contractTemplate: ContractTemplate;
}> = ({ contractAddress, action, contractTemplate }) => {
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
        contractAddress={contractAddress}
        action={action}
        contractTemplate={contractTemplate}
      />
    );
};

export default AbiForm;
