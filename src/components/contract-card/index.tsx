import React from "react";
import { DeployedContract } from "../../utils/constants";

const ContractCard: React.FC<{ contract: DeployedContract }> = ({
  contract,
}) => {
  return <>{contract.template.name}</>;
};

export default ContractCard;
