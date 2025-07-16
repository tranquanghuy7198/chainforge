// From @coral-xyz/anchor

import camelCase from "camelcase";
import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export type Idl = {
  address: string;
  metadata: IdlMetadata;
  docs?: string[];
  instructions: IdlInstruction[];
  accounts?: IdlAccount[];
  events?: IdlEvent[];
  errors?: IdlErrorCode[];
  types?: IdlTypeDef[];
  constants?: IdlConst[];
};
export type IdlMetadata = {
  name: string;
  version: string;
  spec: string;
  description?: string;
  repository?: string;
  dependencies?: IdlDependency[];
  contact?: string;
  deployments?: IdlDeployments;
};
export type IdlDependency = {
  name: string;
  version: string;
};
export type IdlDeployments = {
  mainnet?: string;
  testnet?: string;
  devnet?: string;
  localnet?: string;
};
export type IdlInstruction = {
  name: string;
  docs?: string[];
  discriminator: IdlDiscriminator;
  accounts: IdlInstructionAccountItem[];
  args: IdlField[];
  returns?: IdlType;
};
export type IdlInstructionAccountItem =
  | IdlInstructionAccount
  | IdlInstructionAccounts;
export type IdlInstructionAccount = {
  name: string;
  docs?: string[];
  writable?: boolean;
  isMut?: boolean; // Deprecated, backward compatibility for old IDLs
  signer?: boolean;
  isSigner?: boolean; // Deprecated, backward compatibility for old IDLs
  optional?: boolean;
  address?: string;
  pda?: IdlPda;
  relations?: string[];
};
export type IdlInstructionAccounts = {
  name: string;
  accounts: IdlInstructionAccount[];
};
export type IdlPda = {
  seeds: IdlSeed[];
  program?: IdlSeed;
};
export type IdlSeed = IdlSeedConst | IdlSeedArg | IdlSeedAccount;
export type IdlSeedConst = {
  kind: "const";
  value: number[];
};
export type IdlSeedArg = {
  kind: "arg";
  path: string;
};
export type IdlSeedAccount = {
  kind: "account";
  path: string;
  account?: string;
};
export type IdlAccount = {
  name: string;
  discriminator: IdlDiscriminator;
};
export type IdlEvent = {
  name: string;
  discriminator: IdlDiscriminator;
};
export type IdlConst = {
  name: string;
  type: IdlType;
  value: string;
};
export type IdlErrorCode = {
  name: string;
  code: number;
  msg?: string;
};
export type IdlField = {
  name: string;
  docs?: string[];
  type: IdlType;
};
export type IdlTypeDef = {
  name: string;
  docs?: string[];
  serialization?: IdlSerialization;
  repr?: IdlRepr;
  generics?: IdlTypeDefGeneric[];
  type: IdlTypeDefTy;
};
export type IdlSerialization =
  | "borsh"
  | "bytemuck"
  | "bytemuckunsafe"
  | {
      custom: string;
    };
export type IdlRepr = IdlReprRust | IdlReprC | IdlReprTransparent;
export type IdlReprRust = {
  kind: "rust";
} & IdlReprModifier;
export type IdlReprC = {
  kind: "c";
} & IdlReprModifier;
export type IdlReprTransparent = {
  kind: "transparent";
};
export type IdlReprModifier = {
  packed?: boolean;
  align?: number;
};
export type IdlTypeDefGeneric = IdlTypeDefGenericType | IdlTypeDefGenericConst;
export type IdlTypeDefGenericType = {
  kind: "type";
  name: string;
};
export type IdlTypeDefGenericConst = {
  kind: "const";
  name: string;
  type: string;
};
export type IdlTypeDefTy =
  | IdlTypeDefTyEnum
  | IdlTypeDefTyStruct
  | IdlTypeDefTyType;
export type IdlTypeDefTyStruct = {
  kind: "struct";
  fields?: IdlDefinedFields;
};
export type IdlTypeDefTyEnum = {
  kind: "enum";
  variants: IdlEnumVariant[];
};
export type IdlTypeDefTyType = {
  kind: "type";
  alias: IdlType;
};
export type IdlEnumVariant = {
  name: string;
  fields?: IdlDefinedFields;
};
export type IdlDefinedFields = IdlDefinedFieldsNamed | IdlDefinedFieldsTuple;
export type IdlDefinedFieldsNamed = IdlField[];
export type IdlDefinedFieldsTuple = IdlType[];
export type IdlArrayLen = IdlArrayLenGeneric | IdlArrayLenValue;
export type IdlArrayLenGeneric = {
  generic: string;
};
export type IdlArrayLenValue = number;
export type IdlGenericArg = IdlGenericArgType | IdlGenericArgConst;
export type IdlGenericArgType = {
  kind: "type";
  type: IdlType;
};
export type IdlGenericArgConst = {
  kind: "const";
  value: string;
};
export type IdlType =
  | "bool"
  | "u8"
  | "i8"
  | "u16"
  | "i16"
  | "u32"
  | "i32"
  | "f32"
  | "u64"
  | "i64"
  | "f64"
  | "u128"
  | "i128"
  | "u256"
  | "i256"
  | "bytes"
  | "string"
  | "pubkey"
  | IdlTypeOption
  | IdlTypeCOption
  | IdlTypeVec
  | IdlTypeArray
  | IdlTypeDefined
  | IdlTypeGeneric;
export type IdlTypeOption = {
  option: IdlType;
};
export type IdlTypeCOption = {
  coption: IdlType;
};
export type IdlTypeVec = {
  vec: IdlType;
};
export type IdlTypeArray = {
  array: [idlType: IdlType, size: IdlArrayLen];
};
export type IdlTypeDefined = {
  defined: {
    name: string;
    generics?: IdlGenericArg[];
  };
};
export type IdlTypeGeneric = {
  generic: string;
};
export type IdlDiscriminator = number[];
export declare function isCompositeAccounts(
  accountItem: IdlInstructionAccountItem
): accountItem is IdlInstructionAccounts;
export declare function idlAddress(programId: PublicKey): Promise<PublicKey>;
export declare function seed(): string;
export interface IdlProgramAccount {
  authority: PublicKey;
  data: Buffer;
}
export declare function decodeIdlAccount(data: Buffer): IdlProgramAccount;
export declare function encodeIdlAccount(acc: IdlProgramAccount): Buffer;

/** Conveniently handle all defined field kinds with proper type support. */
export declare function handleDefinedFields<U, N, T>(
  fields: IdlDefinedFields | undefined,
  unitCb: () => U,
  namedCb: (fields: IdlDefinedFieldsNamed) => N,
  tupleCb: (fields: IdlDefinedFieldsTuple) => T
): U | N | T;
//# sourceMappingURL=idl.d.ts.map

export const ACCOUNT_PARAM = "account";
export const ARG_PARAM = "arg";

export const stringifyArgType = (argType: IdlType): string => {
  if (typeof argType === "string") return argType;
  if (Array.isArray(argType))
    return JSON.stringify(argType).replaceAll('"', "");
  return Object.entries(argType)
    .map(([key, value]) => `${key}<${stringifyArgType(value)}>`)
    .join("|");
};

interface ParseContext {
  typeDefs: IdlTypeDef[];
  generics?: Map<string, IdlType>;
}

export class SolanaIdlParser {
  private idl: Idl;

  constructor(idl: Idl) {
    this.idl = idl;
  }

  public parseValue(value: string, idlType: IdlType): any {
    const context: ParseContext = {
      typeDefs: this.idl.types || [],
      generics: new Map(),
    };
    return this.parseValueInternal(value, idlType, context);
  }

  private parseValueInternal(
    value: string,
    idlType: IdlType,
    context: ParseContext
  ): any {
    if (typeof idlType === "string") return this.parsePrimitive(value, idlType);
    if ("option" in idlType)
      return this.parseOption(value, idlType.option, context);
    if ("coption" in idlType)
      return this.parseOption(value, idlType.coption, context);
    if ("vec" in idlType) return this.parseVec(value, idlType.vec, context);
    // if ('array' in idlType) {
    //   return this.parseArray(value, idlType.array[0], idlType.array[1], context);
    // }
    if ("defined" in idlType)
      return this.parseDefined(value, idlType.defined.name, context);
    if ("generic" in idlType) {
      const resolvedType = context.generics?.get(idlType.generic);
      if (resolvedType)
        return this.parseValueInternal(value, resolvedType, context);
    }
    throw new Error(`Unsupported IDL type: ${JSON.stringify(idlType)}`);
  }

  private parsePrimitive(value: string, type: IdlType): any {
    const trimmed = value.trim();
    switch (type) {
      case "bool":
        return trimmed === "true" || trimmed === "1";
      case "u8":
      case "u16":
      case "u32":
      case "i8":
      case "i16":
      case "i32":
        return parseInt(trimmed, 10);
      case "f32":
      case "f64":
        return parseFloat(trimmed);
      case "u64":
      case "i64":
      case "u128":
      case "i128":
      case "u256":
      case "i256":
        return new BN(trimmed);
      case "string":
        return trimmed.replace(/^["']|["']$/g, "");
      case "bytes":
        if (trimmed.startsWith("0x")) {
          return Buffer.from(trimmed.slice(2), "hex");
        }
        return Buffer.from(trimmed, "base64");
      case "pubkey":
        return new PublicKey(trimmed.replace(/^["']|["']$/g, ""));
      default:
        throw new Error(`Unsupported primitive type: ${type}`);
    }
  }

  private parseOption(
    value: string,
    innerType: IdlType,
    context: ParseContext
  ): any {
    const trimmed = value.trim();
    if (["null", "undefined", ""].includes(trimmed)) return null;
    return this.parseValueInternal(value, innerType, context);
  }

  private parseVec(
    value: string,
    elementType: IdlType,
    context: ParseContext
  ): any[] {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed))
      throw new Error(`Expected array for vec type, got: ${typeof parsed}`);
    return parsed.map((item) =>
      this.parseValueInternal(JSON.stringify(item), elementType, context)
    );
  }

  // private parseArray(
  //   value: string,
  //   elementType: IdlType,
  //   size: number | { generic: string },
  //   context: ParseContext
  // ): any[] {
  //   const result = this.parseVec(value, elementType, context);

  //   if (typeof size === "number" && result.length !== size) {
  //     throw new Error(
  //       `Array length mismatch. Expected ${size}, got ${result.length}`
  //     );
  //   }

  //   return result;
  // }

  private parseDefined(
    value: string,
    typeName: string,
    context: ParseContext
  ): any {
    const typeDef = this.idl.types?.find(
      (t) => t.name.toLowerCase() === typeName.toLowerCase()
    );
    if (!typeDef) throw new Error(`Type definition not found: ${typeName}`);
    const parsed = JSON.parse(value);
    if (typeDef.type.kind === "struct") {
      return this.parseStruct(
        parsed,
        (typeDef.type.fields || []) as IdlField[],
        context
      ); // TODO
    }

    // if (typeDef.type.kind === "enum") {
    //   return this.parseEnum(parsed, typeDef.type.variants, context);
    // }

    if (typeDef.type.kind === "type")
      return this.parseValueInternal(value, typeDef.type.alias, context);

    throw new Error(`Unsupported type definition kind: ${typeDef.type.kind}`);
  }

  private parseStruct(
    obj: any,
    fields: IdlField[],
    context: ParseContext
  ): any {
    const result: any = {};
    for (const field of fields) {
      if (camelCase(field.name) in obj) {
        result[camelCase(field.name)] = this.parseValueInternal(
          JSON.stringify(obj[camelCase(field.name)]),
          field.type,
          context
        );
      }
    }
    return result;
  }

  // private parseEnum(
  //   obj: any,
  //   variants: IdlEnumVariant[],
  //   context: ParseContext
  // ): any {
  //   // Handle enum as object with variant name as key
  //   if (typeof obj === "object" && obj !== null) {
  //     const variantName = Object.keys(obj)[0];
  //     const variant = variants.find((v) => v.name === variantName);

  //     if (!variant) {
  //       throw new Error(`Unknown enum variant: ${variantName}`);
  //     }

  //     if (variant.fields) {
  //       if (Array.isArray(variant.fields)) {
  //         // Named fields
  //         if (variant.fields.length > 0 && "name" in variant.fields[0]) {
  //           return {
  //             [variantName]: this.parseStruct(
  //               obj[variantName],
  //               variant.fields as IdlField[],
  //               context
  //             ),
  //           };
  //         }
  //         // Tuple fields
  //         else {
  //           const tupleFields = variant.fields as IdlType[];
  //           const values = Array.isArray(obj[variantName])
  //             ? obj[variantName]
  //             : [obj[variantName]];
  //           return {
  //             [variantName]: values.map((val: any, idx: number) =>
  //               this.parseValueInternal(
  //                 JSON.stringify(val),
  //                 tupleFields[idx],
  //                 context
  //               )
  //             ),
  //           };
  //         }
  //       }
  //     }

  //     return { [variantName]: obj[variantName] };
  //   }

  //   // Handle enum as string (unit variant)
  //   if (typeof obj === "string") {
  //     const variant = variants.find((v) => v.name === obj);
  //     if (!variant) {
  //       throw new Error(`Unknown enum variant: ${obj}`);
  //     }
  //     return obj;
  //   }

  //   throw new Error(`Invalid enum format: ${JSON.stringify(obj)}`);
  // }
}

export function convertIdlToCamelCase<I extends Idl>(idl: I) {
  const KEYS_TO_CONVERT = ["name", "path", "account", "relations", "generic"];

  // `my_account.field` is getting converted to `myAccountField` but we
  // need `myAccount.field`.
  const toCamelCase = (s: any) => s.split(".").map(camelCase).join(".");

  const recursivelyConvertNamesToCamelCase = (obj: Record<string, any>) => {
    for (const key in obj) {
      const val = obj[key];
      if (KEYS_TO_CONVERT.includes(key)) {
        obj[key] = Array.isArray(val) ? val.map(toCamelCase) : toCamelCase(val);
      } else if (typeof val === "object") {
        recursivelyConvertNamesToCamelCase(val);
      }
    }
  };

  const camelCasedIdl = structuredClone(idl);
  recursivelyConvertNamesToCamelCase(camelCasedIdl);
  return camelCasedIdl;
}

export const DEPLOYMENT_INSTRUCTION = "deploy";

export const getFullInstructions = (idl: Idl): IdlInstruction[] => {
  return [
    ...convertIdlToCamelCase(idl).instructions,
    {
      name: DEPLOYMENT_INSTRUCTION,
      discriminator: [],
      accounts: [],
      args: [],
    },
  ];
};
