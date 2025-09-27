import { Blockchain, NetworkCluster, TxResponse } from "@utils/constants";

export const WALLET_STORAGE = "wallets";

export type WalletUI = {
  name: string;
  icon: string;
  backgroundColor: string;
  titleColor: string;
};

export class Wallet {
  public key: string = "";
  public ui: WalletUI;
  public installLink: string;
  public networkCluster: NetworkCluster;
  public address?: string;
  public chainId?: string;

  constructor({
    ui,
    installLink,
    networkCluster,
  }: {
    ui: WalletUI;
    installLink: string;
    networkCluster: NetworkCluster;
  }) {
    this.ui = ui;
    this.installLink = installLink;
    this.networkCluster = networkCluster;
  }

  get verificationKey(): string {
    if (!this.address) throw new Error("Wallet not connected");
    return this.address;
  }

  public async connect(blockchain?: Blockchain) {
    console.log(blockchain);
    throw new Error("Method not implemented.");
  }

  public async signMessage(message: string, nonce?: string): Promise<string> {
    console.log(message, nonce);
    throw new Error("Method not implemented.");
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    args: any,
    extra: any
  ): Promise<TxResponse> {
    console.log(blockchain, abi, bytecode, args, extra);
    throw new Error("Method not implemented.");
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any
  ): Promise<TxResponse> {
    console.log(blockchain, contractAddress, abi, method, args);
    throw new Error("Method not implemented.");
  }

  public async writeContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any,
    extra: any
  ): Promise<TxResponse> {
    console.log(blockchain, contractAddress, abi, method, args, extra);
    throw new Error("Method not implemented.");
  }

  public clone(): Wallet {
    let newWallet = new Wallet({
      ui: this.ui,
      installLink: this.installLink,
      networkCluster: this.networkCluster,
    });
    newWallet.key = this.key;
    newWallet.address = this.address;
    return newWallet;
  }
}
