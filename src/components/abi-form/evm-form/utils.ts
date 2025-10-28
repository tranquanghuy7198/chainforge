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
  return ["tuple", "array", "[", "]"].some((t) => paramType?.includes(t));
};

export const genEvmDefaultParam = (fragmentType: JsonFragmentType): any => {
  const type = fragmentType.type || "";

  // Handle tuple type (struct)
  if (type === "tuple" && fragmentType.components) {
    const result: Record<string, any> = {};
    for (const component of fragmentType.components) {
      const name = component.name || "";
      result[name] = genEvmDefaultParam(component);
    }
    return result;
  }

  // Handle array of tuples
  if (type === "tuple[]" && fragmentType.components) {
    const tupleDefault: Record<string, any> = {};
    for (const component of fragmentType.components) {
      const name = component.name || "";
      tupleDefault[name] = genEvmDefaultParam(component);
    }
    return [tupleDefault];
  }

  // Handle primitive types
  if (type === "address") return "0x0000000000000000000000000000000000000000";
  if (type === "bool") return true;
  if (type === "string") return "string";
  if (type === "bytes") return "0x";
  if (type.startsWith("uint") || type.startsWith("int")) return "0";
  if (type.startsWith("bytes")) {
    const size = parseInt(type.slice(5));
    if (!isNaN(size)) return "0x" + "00".repeat(size);
  }

  // Array types (e.g., uint256[], address[])
  if (type.endsWith("[]")) {
    const baseType = type.slice(0, -2);
    return [genEvmDefaultParam({ ...fragmentType, type: baseType })];
  }

  // Fixed-size arrays (e.g., uint256[5], address[3])
  const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
  if (fixedArrayMatch) {
    const baseType = fixedArrayMatch[1];
    const size = parseInt(fixedArrayMatch[2]);
    return Array(size).fill(
      genEvmDefaultParam({ ...fragmentType, type: baseType })
    );
  }

  // Default fallback
  return null;
};
