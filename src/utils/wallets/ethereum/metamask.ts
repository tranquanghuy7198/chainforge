import {
  BrowserProvider,
  ContractFactory,
  Eip1193Provider,
  ethers,
} from "ethers";
import { Wallet } from "../wallet";
import { Blockchain, NetworkCluster, TxResponse } from "../../constants";
import MetaMaskIcon from "../../../assets/wallets/metamask.svg";

export class MetaMask extends Wallet {
  public key: string = "METAMASK";
  public inject: any;
  public provider: BrowserProvider | null;

  constructor() {
    let ethereum: Eip1193Provider = (window as any).ethereum?.providers
      ? (window as any).ethereum.providers.find((p: any) => !!p.isMetaMask)
      : (window as any).ethereum;
    super({
      ui: {
        name: "MetaMask",
        icon: MetaMaskIcon,
        backgroundColor: "#fcd0a1",
        titleColor: "#cf6b00",
      },
      installLink: "https://metamask.io/download/",
      networkCluster: NetworkCluster.Ethereum,
    });
    this.inject = ethereum;
    this.provider = ethereum
      ? new ethers.BrowserProvider(ethereum, "any")
      : null;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    if (!this.provider)
      throw new Error(
        `MetaMask is not detected in your browser. Install at ${this.installLink}`
      );
    let accounts = await this.provider.send("eth_requestAccounts", []);
    this.address = accounts[0];
    await this.switchChain(blockchain);
  }

  public async deploy(
    blockchain: Blockchain,
    abi: any,
    bytecode: string,
    args: any[],
    payment?: string
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const signer = await this.provider!.getSigner();
    const factory = new ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(
      ...args,
      payment ? { value: payment } : {}
    );
    await contract.waitForDeployment();
    return {
      contractAddress:
        typeof contract.target === "string"
          ? contract.target
          : await contract.target.getAddress(),
      txHash: contract.deploymentTransaction()?.hash,
    };
  }

  public async switchChain(blockchain?: Blockchain) {
    const { chainId } = await this.provider!.getNetwork();
    const chainIdStr = "0x" + chainId.toString(16);
    if (blockchain && chainIdStr !== blockchain.chainId) {
      // Switch here

      // Then set result
      this.chainId = blockchain.chainId;
    } else this.chainId = chainIdStr;
  }

  public async readContract(
    blockchain: Blockchain,
    contractAddress: string,
    abi: any,
    method: string,
    args: any[]
  ): Promise<TxResponse> {
    await this.connect(blockchain);
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const response = await contract[method](...args);
    return { data: response };
  }

  public clone(): Wallet {
    let newWallet = super.clone() as MetaMask;
    newWallet.inject = this.inject;
    newWallet.provider = this.provider;
    return newWallet;
  }
}
