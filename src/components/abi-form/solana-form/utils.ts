import { Connection, PublicKey } from "@solana/web3.js";
import {
  Idl,
  IdlField,
  IdlInstruction,
  IdlInstructionAccount,
  IdlPda,
  IdlSeed,
  IdlType,
  IdlTypeDef,
} from "../../../utils/types/solana";
import { BN, BorshCoder } from "@coral-xyz/anchor";
import { Blockchain } from "../../../utils/constants";
import camelcase from "camelcase";

export const DEPLOYMENT_INSTRUCTION = "deploy";
export const ACCOUNT_PARAM = "account";
export const EXTRA_ACCOUNT_PARAM = "extraAccount";
export const EXTRA_SIGNER = "signer";
export const EXTRA_WRITABLE = "writable";
export const EXTRA_ACCOUNT = "account";
export const ARG_PARAM = "arg";

export type IxRawData = Record<string, Record<string, string>>;

export enum AccountOption {
  Custom = "custom-account",
  Wallet = "wallet-account",
  Program = "program-account",
  System = "system-account",
  Derived = "derived-account",
}

export const deserializeAccountData = async (
  address: PublicKey | string,
  typeName: string,
  idl: Idl,
  blockchain?: Blockchain
): Promise<any> => {
  if (!blockchain) throw new Error("Blockchain not found");

  const connection = new Connection(blockchain.rpcUrl, "confirmed");
  const coder = new BorshCoder(idl);

  // Fetch account data
  const pubkey = new PublicKey(
    typeof address === "string" ? new PublicKey(address) : address
  );
  const accountInfo = await connection.getAccountInfo(pubkey);
  if (!accountInfo) throw new Error("Account does not exist");
  if (!accountInfo.data)
    throw new Error(`No data found for account: ${pubkey.toString()}`);

  // Decode account
  let decoded = null;
  if (idl.accounts?.some((acc) => acc.name === typeName))
    decoded = coder.accounts.decode(typeName, accountInfo.data);
  else if (idl.types?.some((t) => t.name === typeName))
    decoded = coder.types.decode(typeName, accountInfo.data);
  else throw new Error(`Unknown account type: ${typeName}`);

  return decoded;
};

export const deriveFrom = (
  dependees: Record<string, PublicKey>,
  pdaProgramData?: IdlSeed,
  programId?: string
): PublicKey => {
  if (pdaProgramData) {
    if (pdaProgramData.kind === "account")
      return dependees[pdaProgramData.path]; // TODO: do we need to use "pdaProgramData.account?" here?
    if (pdaProgramData.kind === "const")
      return new PublicKey(pdaProgramData.value);
    // TODO: How about kind === "arg"?
  }
  if (programId) return new PublicKey(programId);
  throw new Error("Invalid PDA Program");
};

export const pdaDependees = (pda?: IdlPda): string[] => {
  if (!pda) return [];
  return [
    ...pda.seeds
      .filter((seed) => seed.kind === "account")
      .map((seed) => seed.path),
    ...(pda.program?.kind === "account" ? [pda.program.path] : []),
  ];
};

export const getAccountRoles = (account: IdlInstructionAccount): string[] => {
  const roles: string[] = [];
  if (account.signer) roles.push("Signer");
  if (account.writable) roles.push("Writable");
  return roles;
};
export const getFullInstructions = (idl: Idl): IdlInstruction[] => {
  return [
    ...idl.instructions,
    {
      name: DEPLOYMENT_INSTRUCTION,
      discriminator: [],
      accounts: [],
      args: [],
    },
  ];
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
        return new BN(parseInt(trimmed, 10));
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
    const typeDef = this.idl.types?.find((t) => t.name === typeName);
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
    for (const field of fields)
      if (field.name in obj)
        result[camelcase(field.name)] = this.parseValueInternal(
          JSON.stringify(obj[field.name]),
          field.type,
          context
        );
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

export const stringifyArgType = (argType: IdlType): string => {
  if (typeof argType === "string") return argType;
  if (Array.isArray(argType))
    return JSON.stringify(argType).replaceAll('"', "");
  return Object.entries(argType)
    .map(([key, value]) => `${key}<${stringifyArgType(value)}>`)
    .join("|");
};
