import { SuiMoveAbilitySet } from "@mysten/sui/dist/cjs/client";

export const TYPE_PARAM = "typeParam";
export const PARAM = "param";

export const typeParamKey = (
  typeParam: SuiMoveAbilitySet,
  index: number
): string => {
  return `T${index}${
    typeParam.abilities.length ? `: ${typeParam.abilities.join(" + ")}` : ""
  }`;
};
