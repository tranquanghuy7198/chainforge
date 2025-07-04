import {
  AccountInfo,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { BpfLoaderUpgradeable } from "./bpf-upgradeable";
import { TxResponse } from "../../../constants";
import pLimit from "p-limit";

const MAX_RETRIES = 10;
const SLEEP_MULTIPLIER = 1.4;
const LOAD_CONCURRENCY = 8;

export const initialValidation = async () => {
  //
};

export const buildDeploymentTxs = (
  deployer: PublicKey,
  programBuffer: Buffer,
  programExists: AccountInfo<Buffer> | null,
  bufferBalance: number,
  programBalance: number,
  recentBlockhash: string,
  programId: PublicKey,
  programKp?: Keypair
): Transaction[] => {
  // Create buffer
  const bufferKp = Keypair.generate(); // TODO: understand?

  const createBufferTx = BpfLoaderUpgradeable.createBuffer(
    deployer,
    bufferKp,
    bufferBalance,
    programBuffer.length,
    recentBlockhash
  );

  // Load buffer
  const loadBufferTxs = BpfLoaderUpgradeable.loadBuffer(
    deployer,
    bufferKp.publicKey,
    programBuffer,
    recentBlockhash
  );

  const deploymentTx = !programExists
    ? BpfLoaderUpgradeable.deployProgram(
        deployer,
        bufferKp.publicKey,
        programKp!, // program keypair has been checked before
        programBalance,
        programBuffer.length * 2,
        recentBlockhash
      )
    : BpfLoaderUpgradeable.upgradeProgram(
        programId,
        deployer,
        bufferKp.publicKey,
        deployer,
        recentBlockhash
      );

  const closeBufferTx = BpfLoaderUpgradeable.closeBuffer(
    deployer,
    bufferKp.publicKey,
    recentBlockhash
  );

  return [createBufferTx, deploymentTx, closeBufferTx, ...loadBufferTxs];
};

const sleep = async (ms: number = 300) => {
  return new Promise((res) => setTimeout((s) => res(s), ms));
};

const sendAndRetry = async (
  connection: Connection,
  transaction: Transaction,
  handleError: (e: any) => Promise<void> = async (_) => {}
): Promise<string> => {
  let sleepAmount = 1000;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: true,
      });
    } catch (e) {
      await handleError(e);
      await sleep(sleepAmount);
      sleepAmount *= SLEEP_MULTIPLIER;
    }
  }
  throw new Error(
    `Exceeded maximum amount of retries(${MAX_RETRIES}). Please change RPC endpoint from the settings.`
  );
};

const sendMultipleAndRetry = async (
  connection: Connection,
  transactions: Transaction[]
) => {
  const limit = pLimit(LOAD_CONCURRENCY);
  await Promise.all(
    transactions.map((tx, _) =>
      limit(async () => {
        await sendAndRetry(connection, tx);
      })
    )
  );
};

export const executeDeploymentTxs = async (
  connection: Connection,
  transactions: Transaction[]
): Promise<TxResponse> => {
  const [createBufferTx, deploymentTx, closeBufferTx, ...loadBufferTxs] =
    transactions;

  await sendAndRetry(connection, createBufferTx);
  await sendMultipleAndRetry(connection, loadBufferTxs);
  await sleep(500);
  const deploymentHash = await sendAndRetry(
    connection,
    deploymentTx,
    async (e) => {
      if (e instanceof Error) {
        if (e.message.endsWith("0x0")) {
          await connection.sendRawTransaction(closeBufferTx.serialize());
          throw new Error("Incorrect program ID");
        } else if (e.message.endsWith("0x1")) {
          await connection.sendRawTransaction(closeBufferTx.serialize());
          throw new Error("Out of wallet balance");
        }
      }
    }
  );
  if (!deploymentHash) {
    await connection.sendRawTransaction(closeBufferTx.serialize());
    throw new Error("Deployment failed");
  }
  return { txHash: deploymentHash };
};
