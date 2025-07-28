import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Blockchain, NetworkCluster, TxResponse } from "../../constants";
import { Wallet } from "../wallet";
import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import SuperJSON from "superjson";
import { SolanaExtra } from "./utils";
import {
  BpfLoaderUpgradeable,
  buildDeploymentTxs,
  executeDeploymentTxs,
} from "solana-bpf";

class Solana extends Wallet {
  public provider: BaseMessageSignerWalletAdapter;

  constructor(
    provider: BaseMessageSignerWalletAdapter,
    backgroundColor: string,
    titleColor: string,
    installLink: string
  ) {
    super({
      ui: {
        name: provider.name,
        icon: provider.icon,
        backgroundColor: backgroundColor,
        titleColor: titleColor,
      },
      installLink: installLink,
      networkCluster: NetworkCluster.Solana,
    });
    this.provider = provider;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    if (
      !this.provider ||
      this.provider?.readyState === WalletReadyState.NotDetected
    )
      throw new Error(
        `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
      );
    await this.provider.connect();
    this.address = this.provider.publicKey?.toString();
    if (blockchain) this.chainId = blockchain.chainId;
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    _args: any, // We don't need Solana args when deploying
    extra: SolanaExtra
  ): Promise<TxResponse> {
    // Prepare data
    await this.connect(blockchain);
    const connection = new Connection(blockchain.rpcUrl, "confirmed");
    const programKeypair = extra.programKeypair
      ? Keypair.fromSecretKey(Uint8Array.from(extra.programKeypair))
      : undefined;

    // Some initial validation
    const programId = new PublicKey((abi as Idl).address);
    const programExists = await connection.getAccountInfo(programId);
    const programBuffer = Buffer.from(bytecode, "hex");
    const bufferBalance = await connection.getMinimumBalanceForRentExemption(
      BpfLoaderUpgradeable.getBufferAccountSize(programBuffer.length)
    );
    const programBalance = await connection.getMinimumBalanceForRentExemption(
      BpfLoaderUpgradeable.getBufferAccountSize(
        BpfLoaderUpgradeable.BUFFER_PROGRAM_SIZE
      )
    );
    if (!programExists && !programKeypair)
      throw new Error("Program keypair is required for initial deployment");

    // Build all necessary transactions
    const recentBlockhash = await connection.getLatestBlockhash();
    const txs = buildDeploymentTxs(
      this.provider.publicKey!,
      programBuffer,
      programExists,
      bufferBalance,
      programBalance,
      recentBlockhash.blockhash,
      programId,
      programKeypair
    );

    // Sign and execute
    const signedTxs = await this.provider.signAllTransactions(txs);
    const txSignature = await executeDeploymentTxs(connection, signedTxs);
    return { contractAddress: programId.toBase58(), txHash: txSignature };
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: [any[], Record<string, PublicKey>]
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const [params, accounts] = args;
    const program = new Program(
      { ...abi, address: contractAddress } as Idl,
      new AnchorProvider(
        new Connection(blockchain.rpcUrl, "confirmed"),
        {
          publicKey: new PublicKey(this.address!),
          signTransaction: async () => {
            throw new Error();
          },
          signAllTransactions: async () => {
            throw new Error();
          },
        },
        { commitment: "confirmed" }
      )
    );
    const result = await program.methods[method](...params)
      .accounts(accounts)
      .view();
    return {
      data: JSON.stringify(JSON.parse(SuperJSON.stringify(result)).json),
    };
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: [any[], Record<string, PublicKey>],
    extra: SolanaExtra
  ): Promise<TxResponse> {
    // Prepare connection
    await this.connect(blockchain);
    const connection = new Connection(blockchain.rpcUrl, "confirmed");
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    // Prepare with program instruction
    const program = new Program(
      { ...abi, address: contractAddress } as Idl,
      this.provider as any
    );
    const [params, accounts] = args;
    const programInstruction = await program.methods[method](...params)
      .accounts(accounts)
      .remainingAccounts(extra.remainingAccounts || [])
      .instruction();

    // Prepare transaction
    const tx = new Transaction();
    for (const ix of extra.instructions)
      if (ix) tx.add(ix);
      else tx.add(programInstruction);

    // Send transaction
    const signature = await this.provider.sendTransaction(tx, connection);
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
      minContextSlot,
    });
    return { txHash: signature };
  }
}

export class Phantom extends Solana {
  public key: string = "PHANTOM";

  constructor() {
    super(
      new PhantomWalletAdapter(),
      "#c3bbff",
      "#5345ba",
      "https://phantom.com/download"
    );
  }
}

export class Solflare extends Solana {
  public key: string = "SOLFLARE";

  constructor() {
    super(
      new SolflareWalletAdapter(),
      "#ffffc4",
      "#e7d000",
      "https://www.solflare.com/download/"
    );
  }
}
