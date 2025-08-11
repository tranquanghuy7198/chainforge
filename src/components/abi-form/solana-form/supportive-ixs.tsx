import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { IdlInstruction } from "../../../utils/types/solana";
import { ACCOUNT_PARAM, ARG_PARAM, IxRawData, SolanaIdlParser } from "./utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import { BN, web3 } from "@coral-xyz/anchor";

export type SolanaInstruction = {
  id: string;
  name: string;
  idlInstruction: IdlInstruction;
  rawData: IxRawData;
  parseIx?: (data: IxRawData) => TransactionInstruction[];
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
  parseIx: (data: IxRawData) => [
    createApproveInstruction(
      new PublicKey(data[ACCOUNT_PARAM]!["token"]),
      new PublicKey(data[ACCOUNT_PARAM]!["delegate"]),
      new PublicKey(data[ACCOUNT_PARAM]!["owner"]),
      new BN(parseInt(data[ARG_PARAM]!["amount"], 10)),
      undefined,
      new PublicKey(data[ACCOUNT_PARAM]!["token_program"])
    ),
  ],
};

const INIT_ATA_IX: SolanaInstruction = {
  id: "",
  name: "Initialize Associated Token Account",
  idlInstruction: {
    name: "initAssociatedTokenAccount",
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
  parseIx: (data: IxRawData) => [
    createAssociatedTokenAccountInstruction(
      new PublicKey(data[ACCOUNT_PARAM]!["payer"]),
      new PublicKey(data[ACCOUNT_PARAM]!["token"]),
      new PublicKey(data[ACCOUNT_PARAM]!["owner"]),
      new PublicKey(data[ACCOUNT_PARAM]!["mint"]),
      new PublicKey(data[ACCOUNT_PARAM]!["token_program"])
    ),
  ],
};

const WRAP_SOL_IX: SolanaInstruction = {
  id: "",
  name: "Wrap native SOL",
  idlInstruction: {
    name: "wrapSol",
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8], // TODO
    accounts: [
      { name: "owner", signer: true, writable: true },
      { name: "native_mint", signer: false, writable: false },
      {
        name: "wrapped_token",
        signer: false,
        writable: true,
        pda: {
          seeds: [
            { kind: "account", path: "owner" },
            { kind: "account", path: "token_program" },
            { kind: "account", path: "native_mint" },
          ],
          program: {
            kind: "const",
            value: Array.from(ASSOCIATED_TOKEN_PROGRAM_ID.toBytes()),
          },
        },
      },
      { name: "token_program", signer: false, writable: false },
    ],
    args: [{ name: "lamports", type: "u64" }],
  },
  rawData: {},
  parseIx: (data: IxRawData) => [
    SystemProgram.transfer({
      fromPubkey: new PublicKey(data[ACCOUNT_PARAM]!["owner"]),
      toPubkey: new PublicKey(data[ACCOUNT_PARAM]!["wrapped_token"]),
      lamports: new BN(parseInt(data[ARG_PARAM]!["lamports"], 10)),
    }),
    createSyncNativeInstruction(
      new PublicKey(data[ACCOUNT_PARAM]!["wrapped_token"]),
      new PublicKey(data[ACCOUNT_PARAM]!["token_program"])
    ),
  ],
};

const UNWRAP_SOL_IX: SolanaInstruction = {
  id: "",
  name: "Unwrap wSOL",
  idlInstruction: {
    name: "unwrapSol",
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8], // TODO
    accounts: [
      { name: "owner", signer: true, writable: true },
      { name: "native_mint", signer: false, writable: false },
      {
        name: "wrapped_token",
        signer: false,
        writable: true,
        pda: {
          seeds: [
            { kind: "account", path: "owner" },
            { kind: "account", path: "token_program" },
            { kind: "account", path: "native_mint" },
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
  parseIx: (data: IxRawData) => [
    createCloseAccountInstruction(
      new PublicKey(data[ACCOUNT_PARAM]!["wrapped_token"]),
      new PublicKey(data[ACCOUNT_PARAM]!["owner"]),
      new PublicKey(data[ACCOUNT_PARAM]!["owner"]),
      [],
      new PublicKey(data[ACCOUNT_PARAM]!["token_program"])
    ),
  ],
};

const VERIFY_SIGNATURE_IX: SolanaInstruction = {
  id: "",
  name: "Verify ED25519 Signature",
  idlInstruction: {
    name: "verifySignature",
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8], // TODO
    accounts: [{ name: "signer", signer: false, writable: false }],
    args: [
      {
        name: "message",
        type: "bytes",
        docs: ["Message in number array format"],
      },
      {
        name: "signature",
        type: "bytes",
        docs: ["Signature in number array format"],
      },
    ],
  },
  rawData: {},
  parseIx: (data: IxRawData) => [
    web3.Ed25519Program.createInstructionWithPublicKey({
      publicKey: new PublicKey(data[ACCOUNT_PARAM]!["signer"]).toBytes(),
      message: SolanaIdlParser.parseBytes(data[ARG_PARAM]!["message"]),
      signature: SolanaIdlParser.parseBytes(data[ARG_PARAM]!["signature"]),
    }),
  ],
};

const INIT_ACCOUNT_IX: SolanaInstruction = {
  id: "",
  name: "Initialize Basic Account",
  idlInstruction: {
    name: "initBasicAccount",
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8], // TODO
    accounts: [
      { name: "payer", signer: true, writable: true },
      { name: "account", signer: false, writable: true },
    ],
    args: [],
  },
  rawData: {},
  parseIx: (data: IxRawData) => [
    SystemProgram.transfer({
      fromPubkey: new PublicKey(data[ACCOUNT_PARAM]!["payer"]),
      toPubkey: new PublicKey(data[ACCOUNT_PARAM]!["account"]),
      lamports: 900000,
    }),
  ],
};

export const SUPPORTIVE_IXS = [
  INIT_ACCOUNT_IX,
  INIT_ATA_IX,
  APPROVE_SPL_TOKEN_IX,
  WRAP_SOL_IX,
  UNWRAP_SOL_IX,
  VERIFY_SIGNATURE_IX,
];
