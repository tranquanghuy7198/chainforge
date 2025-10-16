import {
  Aptos,
  AptosConfig,
  MoveFunction,
  MoveFunctionGenericTypeParam,
  MoveFunctionVisibility,
  MoveModule,
  Network,
} from "@aptos-labs/ts-sdk";
import { AbiAction, Blockchain, ContractAddress } from "@utils/constants";

export const APTOS_TYPE_PARAM = "typeParam";
export const APTOS_PARAM = "param";

// Human-readable type param name, to use as an input placeholder
export const aptosTypeParamName = (
  typeParam: MoveFunctionGenericTypeParam,
  index: number
): string => {
  return `T${index}${
    typeParam.constraints.length ? `: ${typeParam.constraints.join(" + ")}` : ""
  }`;
};

export const getAptosFuncs = (
  abi: MoveModule,
  action: AbiAction
): MoveFunction[] => {
  if (action === AbiAction.Deploy) return [];
  const functions = abi.exposed_functions.filter(
    (func) => func.visibility === MoveFunctionVisibility.PUBLIC && func.is_entry
  );
  if (action === AbiAction.Read)
    return functions.filter((func) => func.is_view);
  return functions.filter((func) => !func.is_view);
};

export const fetchAptosModule = async (
  blockchain: Blockchain,
  contractAddress: ContractAddress
): Promise<MoveModule | undefined> => {
  if (!contractAddress.module) return;
  const config = new AptosConfig({ network: blockchain.chainId as Network });
  const client = new Aptos(config);
  const aptosModule = await client.getAccountModule({
    accountAddress: contractAddress.address,
    moduleName: contractAddress.module,
  });
  return aptosModule.abi;
};
