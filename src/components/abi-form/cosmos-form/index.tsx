import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";
import useNotification from "antd/es/notification/useNotification";
import React from "react";
import CollapseForm from "@components/abi-form/collapse-form";
import { getCowmWasmFuncs } from "@components/abi-form/cosmos-form/utils";
import "@/styles.scss";

const CosmosForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({ action, contractTemplate, contractAddress, wallet, blockchain }) => {
  const [notification, contextHolder] = useNotification();

  return (
    <>
      {contextHolder}
      <CollapseForm
        items={getCowmWasmFuncs(contractTemplate.abi, action).map(
          ([funcName, funcData]) => ({
            key: funcName,
            label: <div className="function-name">{funcName}</div>,
            children: <></>,
          })
        )}
      />
    </>
  );
};

export default CosmosForm;
