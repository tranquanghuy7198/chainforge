import { shorten } from "@utils/utils";
import {
  SuiClient,
  SuiMoveAbilitySet,
  SuiMoveNormalizedFunction,
  SuiMoveNormalizedModule,
  SuiMoveNormalizedModules,
  SuiMoveNormalizedType,
} from "@mysten/sui/client";
import { AbiAction, Blockchain, ContractAddress } from "@utils/constants";

export const SUI_DEPLOYMENT_TRANSACTION = "deploy";
export const TYPE_PARAM = "typeParam";
export const PARAM = "param";
export const TX_CONTEXT = "0x2::tx_context::TxContext";

export type TxRawData = {
  [TYPE_PARAM]?: string[];
  [PARAM]?: string[];
};

export const funcAction = (
  func: [string, SuiMoveNormalizedFunction]
): AbiAction | null => {
  const [funcName, funcData] = func;
  if (!funcData.isEntry) return null;
  if (funcData.visibility !== "Public") return null;
  if (funcName === SUI_DEPLOYMENT_TRANSACTION) return AbiAction.Deploy;
  return AbiAction.Write; // TODO: Distinguish read and write
};

// Human-readable type param name, to use as an input placeholder
export const typeParamName = (
  typeParam: SuiMoveAbilitySet,
  index: number
): string => {
  return `T${index}${
    typeParam.abilities.length ? `: ${typeParam.abilities.join(" + ")}` : ""
  }`;
};

// Human-readable param name, to use as an input placeholder
export const paramName = (
  param: SuiMoveNormalizedType,
  typeParams: SuiMoveAbilitySet[],
  prefix: string = ""
): string => {
  if (typeof param === "string") return `${prefix}${param}`;
  if ("TypeParameter" in param)
    return `${prefix}${
      typeParamName(typeParams[param.TypeParameter], param.TypeParameter) ??
      `T${param.TypeParameter}`
    }`;
  if ("Reference" in param || "MutableReference" in param)
    return paramName(
      "Reference" in param ? param.Reference : param.MutableReference,
      typeParams,
      prefix
    );
  if ("Vector" in param)
    return `${paramName(param.Vector, typeParams, `${prefix}Vector<`)}>`;
  if ("Struct" in param) {
    const typeArgsName = param.Struct.typeArguments
      .map((typeArg) => paramName(typeArg, typeParams))
      .join(", ");
    return `${[
      shorten(param.Struct.address),
      param.Struct.module,
      param.Struct.name,
    ].join("::")}${typeArgsName ? `<${typeArgsName}>` : ""}`;
  }
  return prefix;
};

export const getFullSuiTransactions = (
  packageAbi: SuiMoveNormalizedModules, // ABI is {} before we deploy anything
  pkg?: ContractAddress // not available when we deploy a new pkg
): [string, SuiMoveNormalizedFunction][] => {
  const moduleAbi = pkg?.module ? packageAbi[pkg.module] : undefined;
  return Object.entries({
    ...(moduleAbi?.exposedFunctions ?? {}),
    [SUI_DEPLOYMENT_TRANSACTION]: {
      isEntry: true,
      parameters: [],
      return: [],
      typeParameters: [],
      visibility: "Public",
    },
  });
};

export const fetchSuiAbi = async (
  blockchain: Blockchain,
  pkg: string
): Promise<SuiMoveNormalizedModules> => {
  const client = new SuiClient({ url: blockchain.rpcUrl });
  return await client.getNormalizedMoveModulesByPackage({ package: pkg });
};
