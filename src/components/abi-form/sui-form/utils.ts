import {
  SuiMoveAbilitySet,
  SuiMoveNormalizedType,
} from "@mysten/sui/dist/cjs/client";

export const TYPE_PARAM = "typeParam";
export const PARAM = "param";

export const typeParamName = (
  typeParam: SuiMoveAbilitySet,
  index: number
): string => {
  return `T${index}${
    typeParam.abilities.length ? `: ${typeParam.abilities.join(" + ")}` : ""
  }`;
};

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
    return `${prefix}${paramName(
      param.Vector,
      typeParams,
      `${prefix}Vector<`
    )}>`;
  if ("Struct" in param) {
    const typeArgsName = param.Struct.typeArguments
      .map((typeArg) => paramName(typeArg, typeParams))
      .join(", ");
    return `${[
      param.Struct.address,
      param.Struct.module,
      param.Struct.name,
    ].join("::")}${typeArgsName ? `<${typeArgsName}>` : ""}`;
  }
  return prefix;
};
