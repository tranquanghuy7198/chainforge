import { TransactionInstruction } from "@solana/web3.js";

export type SolanaExtra = {
  programKeypair?: number[];
  supportiveInstructions?: TransactionInstruction[];
};
