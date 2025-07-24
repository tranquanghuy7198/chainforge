import { Connection, PublicKey } from "@solana/web3.js";
import { Idl } from "../../../utils/types/solana";
import { BorshCoder } from "@coral-xyz/anchor";
import { Blockchain } from "../../../utils/constants";

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
