import { EvmAbiField, EvmAbiFunction } from "@utils/constants";

export const funcSignature = (func: EvmAbiFunction): string => {
  if (!func.name) return func.type;
  return `${func.name}(${func.inputs.map((param) => param.type).join(",")})`;
};

export const paramKey = (param: EvmAbiField, index: number): string => {
  return `${param.name}_${index}`;
};
