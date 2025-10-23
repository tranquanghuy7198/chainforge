import { AbiAction } from "@utils/constants";
import { JsonFragment, JsonFragmentType, keccak256, toUtf8Bytes } from "ethers";

export const EVM_PAYABLE_AMOUNT = "payable";

export const getEvmAbiFunctions = (
  abi: JsonFragment[],
  action: AbiAction
): JsonFragment[] => {
  return abi.filter((func) => {
    switch (action) {
      case AbiAction.Deploy:
        return func.type === "constructor";
      case AbiAction.Read:
        return (
          func.type === "function" &&
          (func.stateMutability === "view" || func.stateMutability === "pure")
        );
      case AbiAction.Write:
        return (
          func.type === "function" &&
          func.stateMutability !== "view" &&
          func.stateMutability !== "pure"
        );
      default:
        return false;
    }
  });
};

const paramSignature = (param: JsonFragmentType): string => {
  if (!param.type) return "";
  if (param.type === "tuple")
    return `(${param.components!.map(paramSignature).join(",")})`;
  if (param.type === "array")
    return `${paramSignature(param.components![0])}[]`;
  return param.type;
};

export const funcSignature = (func: JsonFragment): string => {
  if (!func.name) return func.type || "";
  return `${func.name}(${func.inputs?.map(paramSignature).join(",")})`;
};

export const paramKey = (param: JsonFragmentType, index: number): string => {
  return `${param.name}_${index}`;
};

export const evmFunctionSelector = (func: JsonFragment): string => {
  if (!func.name) return "0x60806040";
  return keccak256(toUtf8Bytes(funcSignature(func))).slice(0, 10);
};

export const isComplex = (paramType?: string): boolean => {
  return ["tuple", "array", "[]"].some((t) => paramType?.includes(t));
};
