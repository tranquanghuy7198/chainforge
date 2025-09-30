import { SuiMoveNormalizedType } from "@mysten/sui/client";
import { PureTypeName } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const parseParam = (
  tx: Transaction,
  rawParam: string,
  type: SuiMoveNormalizedType
): any => {
  if (typeof type === "object" && "Reference" in type)
    return parseParam(tx, rawParam, type.Reference);
  if (typeof type === "object" && "MutableReference" in type)
    return parseParam(tx, rawParam, type.MutableReference);
  if (typeof type === "object" && "Vector" in type)
    return parseVector(tx, rawParam, type.Vector);
  if (typeof type === "object" && "Struct" in type) return tx.object(rawParam);
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
): any => {
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
  } else if ("Struct" in elementType)
    return tx.makeMoveVec({
      type: buildStructTypeString(elementType.Struct),
      elements: (JSON.parse(rawParam) as Array<any>).map((objectId) =>
        tx.object(String(objectId))
      ),
    });
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
