import { AbiAction } from "@utils/constants";
import { keccak256, toUtf8Bytes } from "ethers";

export const EVM_PAYABLE_AMOUNT = "payable";

type EvmAbiField = {
  internalType: string;
  name: string;
  type: string;
};

export type EvmAbiFunction = {
  name?: string; // No name for constructor
  inputs: EvmAbiField[];
  outputs?: any; // No outputs for constructor
  stateMutability: "view" | "payable" | "nonpayable";
  type: "constructor" | "function" | "event";
  anonymous?: boolean; // For events only
};

export type EvmAbi = EvmAbiFunction[];

export const getEvmAbiFunctions = (
  abi: EvmAbi,
  action: AbiAction
): EvmAbiFunction[] => {
  return abi.filter((func) => {
    switch (action) {
      case AbiAction.Deploy:
        return func.type === "constructor";
      case AbiAction.Read:
        return func.type === "function" && func.stateMutability === "view";
      case AbiAction.Write:
        return func.type === "function" && func.stateMutability !== "view";
      default:
        return false;
    }
  });
};

export const funcSignature = (func: EvmAbiFunction): string => {
  if (!func.name) return func.type;
  return `${func.name}(${func.inputs.map((param) => param.type).join(",")})`;
};

export const paramKey = (param: EvmAbiField, index: number): string => {
  return `${param.name}_${index}`;
};

export const evmFunctionSelector = (func: EvmAbiFunction): string => {
  if (!func.name) return "0x60806040";
  const functionSignature = `${func.name}(${func.inputs
    .map((param) => param.type)
    .join(",")})`;
  return keccak256(toUtf8Bytes(functionSignature)).slice(0, 10);
};
