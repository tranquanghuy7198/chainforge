import { Blockchain, NetworkCluster, TxResponse } from "../constants";

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

  public async connect(blockchain?: Blockchain) {
    //
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    args: any[],
    payment?: string
  ): Promise<TxResponse> {
    console.log(blockchain, abi, bytecode, args, payment);
    throw new Error("Method not implemented.");
  }

  public async readContract() {
    //
  }

  public async writeContract() {
    //
  }

  public async sign() {
    //
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
