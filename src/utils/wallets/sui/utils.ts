import { SuiMoveNormalizedType } from "@mysten/sui/client";
import { PureTypeName } from "@mysten/sui/bcs";
import { Argument, Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";

export const parseParam = (
  tx: Transaction,
  rawParam: string,
  type: SuiMoveNormalizedType
): Argument => {
  if (typeof type === "object" && "Reference" in type)
    return parseParam(tx, rawParam, type.Reference);
  if (typeof type === "object" && "MutableReference" in type)
    return parseParam(tx, rawParam, type.MutableReference);
  if (typeof type === "object" && "Vector" in type)
    return parseVector(tx, rawParam, type.Vector);
  if (typeof type === "object" && "Struct" in type) {
    if (isSuiCoin(type.Struct)) return tx.splitCoins(tx.gas, [rawParam])[0];
    return tx.object(rawParam);
  }
  if (typeof type === "object" && "TypeParameter" in type)
    throw new Error(
      `TypeParameter ${type.TypeParameter} requires type argument context. ` +
        `Cannot parse without knowing the concrete type.`
    );
  if (typeof type === "string") {
    switch (type) {
      case "Bool":
        return tx.pure.bool(JSON.parse(rawParam));
      case "U8":
        return tx.pure.u8(JSON.parse(rawParam));
      case "U16":
        return tx.pure.u16(JSON.parse(rawParam));
      case "U32":
        return tx.pure.u32(JSON.parse(rawParam));
      case "U64":
        return tx.pure.u64(rawParam);
      case "U128":
        return tx.pure.u128(rawParam);
      case "U256":
        return tx.pure.u256(rawParam);
      case "Address":
        return tx.pure.address(rawParam);
      case "Signer":
        return tx.pure.address(rawParam);
      default:
        throw new Error(`Unknown primitive type: ${type}`);
    }
  }
  throw new Error(`Unsupported type: ${JSON.stringify(type)}`);
};

const parseVector = (
  tx: Transaction,
  rawParam: string,
  elementType: SuiMoveNormalizedType
): Argument => {
  if (typeof elementType === "string") {
    if (elementType === "U8") {
      try {
        const parsed = JSON.parse(rawParam); // case "[1, 2, 3]"
        if (Array.isArray(parsed)) return tx.pure.vector("u8", parsed);
      } catch (e) {}
      return tx.pure.string(rawParam); // case "abc"
    }
    if (["Bool", "U16", "U32"].includes(elementType))
      return tx.pure.vector(
        elementType.toLowerCase() as PureTypeName,
        (JSON.parse(rawParam) as Array<any>).map((value) =>
          JSON.parse(String(value))
        )
      );
    if (["U64", "U128", "U256", "Address"].includes(elementType))
      return tx.pure.vector(
        elementType.toLowerCase() as PureTypeName,
        (JSON.parse(rawParam) as Array<any>).map((value) => String(value))
      );
    throw new Error(`Unsupported vector element type: ${elementType}`);
  } else if ("Struct" in elementType) {
    if (isSuiCoin(elementType.Struct))
      return tx.splitCoins(tx.gas, JSON.parse(rawParam) as any[]);
    return tx.makeMoveVec({
      type: buildStructTypeString(elementType.Struct),
      elements: (JSON.parse(rawParam) as string[]).map((objectId) =>
        tx.object(objectId)
      ),
    });
  }
  throw new Error(
    `Unsupported vector element type: ${JSON.stringify(elementType)}`
  );
};

const buildStructTypeString = (structType: {
  address: string;
  module: string;
  name: string;
  typeArguments: SuiMoveNormalizedType[];
}): string => {
  let typeString = `${structType.address}::${structType.module}::${structType.name}`;

  if (structType.typeArguments.length > 0) {
    const typeArgs = structType.typeArguments
      .map((arg) => {
        if (typeof arg === "string") {
          return arg.toLowerCase();
        } else if (typeof arg === "object" && "Struct" in arg) {
          return buildStructTypeString(arg.Struct);
        }
        return "unknown";
      })
      .join(", ");
    typeString += `<${typeArgs}>`;
  }

  return typeString;
};

// Sui addresses can have 0x-prefix or not, can be full-length or 0-padded
const compareSuiAddress = (addr1: string, addr2: string): boolean => {
  return normalizeSuiAddress(addr1) === normalizeSuiAddress(addr2);
};

export const isSuiCoin = (structType: {
  address: string;
  module: string;
  name: string;
  typeArguments: SuiMoveNormalizedType[];
}): boolean => {
  return (
    compareSuiAddress(structType.address, "0x2") &&
    structType.module === "coin" &&
    structType.name === "Coin" &&
    structType.typeArguments.length === 1 &&
    typeof structType.typeArguments[0] === "object" &&
    "Struct" in structType.typeArguments[0] &&
    compareSuiAddress(structType.typeArguments[0].Struct.address, "0x2") &&
    structType.typeArguments[0].Struct.module === "sui" &&
    structType.typeArguments[0].Struct.name === "SUI"
  );
};
