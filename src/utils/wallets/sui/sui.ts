import { Wallet } from "@utils/wallets/wallet";
import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";
import SuiIcon from "@assets/wallets/sui.svg";
import { SLUSH_WALLET_NAME, SlushWallet } from "@mysten/slush-wallet";
import {
  getWallets,
  IdentifierString,
  StandardConnect,
  WalletAccount,
} from "@wallet-standard/core";
import {
  SuiSignAndExecuteTransaction,
  SuiSignPersonalMessage,
} from "@mysten/wallet-standard";
import { Transaction } from "@mysten/sui/transactions";
import { parseParam } from "@utils/wallets/sui/utils";
import { SuiClient, SuiMoveNormalizedModule } from "@mysten/sui/client";

const SLUSH_EXTENSION_ID = "com.mystenlabs.suiwallet";

export class Slush extends Wallet {
  public key: string = "SLUSH";
  private provider?: SlushWallet;
  private account?: WalletAccount;

  constructor() {
    const wallet = getWallets()
      .get()
      .find((w) => w.id === SLUSH_EXTENSION_ID);
    const slushWallet = wallet ? (wallet as SlushWallet) : undefined;
    super({
      ui: {
        name: slushWallet?.name ?? SLUSH_WALLET_NAME,
        icon: slushWallet?.icon ?? SuiIcon,
        backgroundColor: "#00B8D9",
        titleColor: "#aff3ffff",
      },
      installLink:
        "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
      networkCluster: NetworkCluster.Sui,
    });
    this.provider = slushWallet;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    // Slush is asynchronously injected, try to detect again
    if (!this.provider) {
      const detectedWallet = getWallets()
        .get()
        .find((w) => w.id === SLUSH_EXTENSION_ID);
      if (!detectedWallet)
        throw new Error(
          `Slush is not detected in your browser. Install at ${this.installLink}`
        );
      this.provider = detectedWallet as SlushWallet;
    }

    // Now connect
    const connections = await this.provider.features[StandardConnect].connect();
    if (connections.accounts.length === 0)
      throw new Error(
        `Slush is not detected in your browser. Install at ${this.installLink}`
      );
    const account = connections.accounts[0];
    this.account = account;
    this.address = account.address;
    if (
      blockchain &&
      account.chains.includes(blockchain.chainId as unknown as IdentifierString)
    )
      this.chainId = blockchain.chainId;
  }

  public async signMessage(message: string): Promise<string> {
    await this.connect();
    const { signature } = await this.provider!.features[
      SuiSignPersonalMessage
    ].signPersonalMessage({
      message: Buffer.from(message, "utf-8"),
      account: this.account!,
    });
    return signature;
  }

  public async deploy(
    blockchain: Blockchain,
    _abi: any, // we don't need Sui ABI when deploying
    bytecode: string,
    _args: any, // we don't need args when deploying
    _extra: any // we don't need extra data when deploying
  ): Promise<TxResponse> {
    // Connect first
    await this.connect(blockchain);

    // Prepare a transaction
    const tx = new Transaction();
    const cap = tx.publish(JSON.parse(bytecode));
    tx.transferObjects([cap], tx.pure.address(this.address!));

    // Execute this transaction and analyze the response
    const { digest } = await this.provider!.features[
      SuiSignAndExecuteTransaction
    ].signAndExecuteTransaction({
      transaction: tx,
      account: this.account!,
      chain: blockchain.chainId as unknown as IdentifierString,
    });

    // Fetch the info of the created objects
    const client = new SuiClient({ url: blockchain.rpcUrl });
    const resp = await client.waitForTransaction({
      digest: digest,
      options: { showObjectChanges: true, showEffects: true, showEvents: true },
    });
    const objIds = resp.effects?.created?.map((obj) => obj.reference.objectId);
    const createdInfo = await client.multiGetObjects({
      ids: objIds ?? [],
      options: { showContent: true, showType: true, showOwner: true },
    });

    return {
      txHash: digest,
      contractAddresses: createdInfo
        .filter(
          (obj) =>
            obj.data?.type &&
            obj.data.owner &&
            typeof obj.data.owner === "object" &&
            "Shared" in obj.data.owner
        )
        .map((obj) => {
          const [packageAddress, packageModule] = obj.data!.type!.split("::");
          return {
            blockchainId: blockchain.id,
            address: packageAddress,
            module: packageModule,
            objectId: obj.data?.objectId,
            publicity: false,
          };
        }),
    };
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: [string[], string[]],
    extra: any
  ): Promise<TxResponse> {
    // Connect first
    await this.connect(blockchain);

    // Parse arguments and build transaction
    const [typeParams, params] = args;
    const funcAbi = (abi as SuiMoveNormalizedModule).exposedFunctions[method];
    const tx = new Transaction();
    tx.moveCall({
      target: `${contractAddress}::${method}`,
      typeArguments: typeParams,
      arguments: params.map((param, index) =>
        parseParam(tx, param, funcAbi.parameters[index])
      ),
    });

    // Sign and execute transaction
    const txResponse = await this.provider!.features[
      SuiSignAndExecuteTransaction
    ].signAndExecuteTransaction({
      transaction: tx,
      account: this.account!,
      chain: blockchain.chainId as unknown as IdentifierString,
    });
    return { txHash: txResponse.digest };
  }
}
