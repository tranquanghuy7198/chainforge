import React from "react";
import "./contract-template-card.scss";
import { ContractTemplate } from "../../utils/constants";
import { useAppSelector } from "../../redux/hook";

const ContractTemplateCard: React.FC<{
  contractTemplate: ContractTemplate;
}> = ({ contractTemplate }) => {
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  return <>{contractTemplate.name}</>;
};

export default ContractTemplateCard;
