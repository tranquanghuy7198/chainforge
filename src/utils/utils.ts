import { keccak256, toUtf8Bytes } from "ethers";
import { EvmAbiFunction } from "./constants";

export const capitalize = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const shorten = (value: string): string => {
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
};

export const evmFunctionSelector = (func: EvmAbiFunction): string => {
  if (!func.name) return "60806040";
  const functionSignature = `${func.name}(${func.inputs
    .map((param) => param.type)
    .join(",")})`;
  return keccak256(toUtf8Bytes(functionSignature)).slice(2, 10);
};
