import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
} from "@utils/constants";
import { Wallet } from "@utils/wallets/wallet";

const SuiForm: React.FC<{
  action: AbiAction;
  contractTemplate: ContractTemplate;
  saveDeployedContract: (
    blockchain: Blockchain,
    address: string
  ) => Promise<void>;
  contractAddress?: ContractAddress;
  wallet?: Wallet;
  blockchain?: Blockchain;
}> = ({}) => {
  return <></>;
};

export default SuiForm;
