import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { IdlInstruction } from "../../../utils/types/solana";
import { ACCOUNT_PARAM, ARG_PARAM, IxRawData } from "./utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

export type SolanaInstruction = {
  id: string;
  name: string;
  idlInstruction: IdlInstruction;
  rawData: IxRawData;
  parseIx?: (data: IxRawData) => TransactionInstruction;
};

const APPROVE_SPL_TOKEN_IX: SolanaInstruction = {
  id: "",
  name: "Approve SPL Token",
  idlInstruction: {
    name: "approveSplToken",
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8], // TODO
    accounts: [
      { name: "owner", signer: true, writable: false },
      { name: "mint", signer: false, writable: false },
      { name: "delegate", signer: false, writable: false },
      {
        name: "token",
        signer: false,
        writable: true,
        pda: {
          seeds: [
            { kind: "account", path: "owner" },
            { kind: "account", path: "token_program" },
            { kind: "account", path: "mint" },
          ],
          program: {
            kind: "const",
            value: Array.from(ASSOCIATED_TOKEN_PROGRAM_ID.toBytes()),
          },
        },
      },
      { name: "token_program", signer: false, writable: false },
    ],
    args: [{ name: "amount", type: "u64" }],
  },
  rawData: {},
  parseIx: (data: IxRawData) =>
    createApproveInstruction(
      new PublicKey((data[ACCOUNT_PARAM] as Record<string, string>)["token"]),
      new PublicKey(
        (data[ACCOUNT_PARAM] as Record<string, string>)["delegate"]
      ),
      new PublicKey((data[ACCOUNT_PARAM] as Record<string, string>)["owner"]),
      new BN(
        parseInt((data[ARG_PARAM] as Record<string, string>)["amount"], 10)
      ),
      undefined,
      new PublicKey(
        (data[ACCOUNT_PARAM] as Record<string, string>)["token_program"]
      )
    ),
};

const CREATE_ATA_IX: SolanaInstruction = {
  id: "",
  name: "Create Associated Token Account",
  idlInstruction: {
    name: "createAssociatedTokenAccount",
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8], // TODO
    accounts: [
      { name: "payer", signer: true, writable: false },
      { name: "owner", signer: false, writable: false },
      { name: "mint", signer: false, writable: false },
      {
        name: "token",
        signer: false,
        writable: true,
        pda: {
          seeds: [
            { kind: "account", path: "owner" },
            { kind: "account", path: "token_program" },
            { kind: "account", path: "mint" },
          ],
          program: {
            kind: "const",
            value: Array.from(ASSOCIATED_TOKEN_PROGRAM_ID.toBytes()),
          },
        },
      },
      { name: "token_program", signer: false, writable: false },
    ],
    args: [],
  },
  rawData: {},
  parseIx: (data: IxRawData) =>
    createAssociatedTokenAccountInstruction(
      new PublicKey((data[ACCOUNT_PARAM] as Record<string, string>)["payer"]),
      new PublicKey((data[ACCOUNT_PARAM] as Record<string, string>)["token"]),
      new PublicKey((data[ACCOUNT_PARAM] as Record<string, string>)["owner"]),
      new PublicKey((data[ACCOUNT_PARAM] as Record<string, string>)["mint"]),
      new PublicKey(
        (data[ACCOUNT_PARAM] as Record<string, string>)["token_program"]
      )
    ),
};

const WRAP_SOL_IX: SolanaInstruction = {
  id: "",
  name: "Wrap native SOL",
  idlInstruction: {},
  rawData: {},
  parseIx: (data: IxRawData) => {},
};

const UNWRAP_SOL_IX: SolanaInstruction = {
  id: "",
  name: "Unwrap native SOL",
  idlInstruction: {},
  rawData: {},
  parseIx: (data: IxRawData) => {},
};

export const SUPPORTIVE_IXS = [
  APPROVE_SPL_TOKEN_IX,
  CREATE_ATA_IX,
  WRAP_SOL_IX,
  UNWRAP_SOL_IX,
];
