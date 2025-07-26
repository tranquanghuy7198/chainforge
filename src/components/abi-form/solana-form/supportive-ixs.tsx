import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Idl, IdlInstruction } from "../../../utils/types/solana";
import { ACCOUNT_PARAM, ARG_PARAM, IxRawData } from "./utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

export type SupportiveInstruction = {
  id: string;
  name: string;
  idlInstruction: IdlInstruction;
  rawData: IxRawData;
  parseIx: (data: IxRawData) => TransactionInstruction;
};

const ApproveSplTokenIx: SupportiveInstruction = {
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
            { kind: "const", value: Array.from(TOKEN_PROGRAM_ID.toBytes()) },
            { kind: "account", path: "mint" },
          ],
          program: {
            kind: "const",
            value: Array.from(ASSOCIATED_TOKEN_PROGRAM_ID.toBytes()),
          },
        },
      },
    ],
    args: [{ name: "amount", type: "u64" }],
  },
  rawData: {},
  parseIx: (data: IxRawData) =>
    createApproveInstruction(
      new PublicKey(data[ACCOUNT_PARAM]["token"]),
      new PublicKey(data[ACCOUNT_PARAM]["delegate"]),
      new PublicKey(data[ACCOUNT_PARAM]["owner"]),
      new BN(parseInt(data[ARG_PARAM]["amount"], 10))
    ),
};

export const SUPPORTIVE_IXS = [ApproveSplTokenIx];
