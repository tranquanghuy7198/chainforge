import { Blockchain, NetworkCluster } from "@utils/constants";
import { Keplr } from "@keplr-wallet/provider-extension";
import { Wallet } from "@utils/wallets/wallet";

const DEFAULT_COSMOS_CHAIN = "cosmoshub-4";

export class KeplrWallet extends Wallet {
  public key: string = "KEPLR";
  private provider: Keplr | undefined;

  constructor() {
    super({
      ui: {
        name: "Keplr",
        icon: "https://docs.keplr.app/img/keplr-logo-256.png",
        backgroundColor: "#9bddf7",
        titleColor: "#14afeb",
      },
      installLink:
        "https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en",
      networkCluster: NetworkCluster.Cosmos,
    });
    this.provider = (window as any).keplr;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    // Try detecting once more
    if (!this.provider) {
      this.provider = (window as any).keplr;
      if (!this.provider)
        throw new Error(
          `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
        );
    }

    // Connect
    const chainId = blockchain?.chainId || DEFAULT_COSMOS_CHAIN;
    await this.provider.enable(chainId);
    const walletKey = await this.provider.getKey(chainId);
    this.address = walletKey.bech32Address;
  }

  public async signMessage(message: string): Promise<string> {
    await this.connect();
    const { signature } = await this.provider!.signArbitrary(
      DEFAULT_COSMOS_CHAIN,
      this.address!,
      message
    );
    return signature;
  }
}
