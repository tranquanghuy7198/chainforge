import { AccountMeta, TransactionInstruction } from "@solana/web3.js";

export type SolanaExtra = {
  programKeypair?: number[];
  remainingAccounts?: Array<AccountMeta>;
  instructions: (TransactionInstruction | null)[];
};
