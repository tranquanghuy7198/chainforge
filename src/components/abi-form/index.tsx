import React from "react";
import "./abi-form.scss";
import { AbiAction, NetworkCluster } from "../../utils/constants";
import EvmForm from "./evm-form";
import SuiForm from "./sui-form";

const AbiForm: React.FC<{
  networkClusters: NetworkCluster[];
  action: AbiAction;
  abi: any;
}> = ({ networkClusters, action, abi }) => {
  if (networkClusters.includes(NetworkCluster.Sui))
    return <SuiForm action={action} abi={abi} />;
  else if (networkClusters.includes(NetworkCluster.Solana))
    return <>Available soon</>;
  else if (networkClusters.includes(NetworkCluster.Cosmos))
    return <>Available soon</>;
  else if (networkClusters.includes(NetworkCluster.FlowChain))
    return <>Available soon</>;
  else
    return (
      <EvmForm networkClusters={networkClusters} action={action} abi={abi} />
    );
};

export default AbiForm;
