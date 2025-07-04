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
  signer?: boolean;
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

export const parseArg = (
  argValue: string,
  argType: IdlType
): string | PublicKey | BN => {
  if (argType === "pubkey") return new PublicKey(argValue);
  if (
    ["u64", "u128", "u256", "i64", "i128", "i256"].includes(argType.toString())
  )
    return new BN(argValue);
  return argValue;
};

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
