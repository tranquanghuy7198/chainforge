import { shorten } from "@utils/utils";
import {
  SuiMoveAbilitySet,
  SuiMoveNormalizedFunction,
  SuiMoveNormalizedType,
} from "@mysten/sui/client";
import { AbiAction } from "@utils/constants";

export const TYPE_PARAM = "typeParam";
export const PARAM = "param";
export const TX_CONTEXT = "0x2::tx_context::TxContext";

export type TxRawData = {
  [TYPE_PARAM]?: string[];
  [PARAM]?: string[];
};

export const funcAction = (
  func: SuiMoveNormalizedFunction
): AbiAction | null => {
  if (!func.isEntry) return null;
  if (func.visibility !== "Public") return null;
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
