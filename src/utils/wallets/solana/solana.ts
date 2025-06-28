import {
  NightlyWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Blockchain, NetworkCluster } from "../../constants";
import { Wallet } from "../wallet";
import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
} from "@solana/wallet-adapter-base";

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

export class Nightly extends Solana {
  public key: string = "NIGHTLY";

  constructor() {
    super(
      new NightlyWalletAdapter(),
      "#c3bbff",
      "#5345ba",
      "https://nightly.app/download"
    );
  }
}
