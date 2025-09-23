import { keccak256, toUtf8Bytes } from "ethers";

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

export const funcSignature = (func: EvmAbiFunction): string => {
  if (!func.name) return func.type;
  return `${func.name}(${func.inputs.map((param) => param.type).join(",")})`;
};

export const paramKey = (param: EvmAbiField, index: number): string => {
  return `${param.name}_${index}`;
};

export const evmFunctionSelector = (func: EvmAbiFunction): string => {
  if (!func.name) return "60806040";
  const functionSignature = `${func.name}(${func.inputs
    .map((param) => param.type)
    .join(",")})`;
  return keccak256(toUtf8Bytes(functionSignature)).slice(2, 10);
};
