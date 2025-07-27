import { TransactionInstruction } from "@solana/web3.js";

export type SolanaExtra = {
  programKeypair?: number[];
  instructions: (TransactionInstruction | null)[];
};
