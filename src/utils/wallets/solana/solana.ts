import {
  NightlyWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Blockchain, NetworkCluster } from "../../constants";
import { Wallet, WalletUI } from "../wallet";
import PhantomWalletIcon from "../../../assets/wallets/phantom.svg";
import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
} from "@solana/wallet-adapter-base";

class Solana extends Wallet {
  public provider: BaseMessageSignerWalletAdapter;

  constructor(
    ui: WalletUI,
    installLink: string,
    provider: BaseMessageSignerWalletAdapter
  ) {
    super({
      ui: {
        ...ui,
        name: provider.name || ui.name,
        icon: provider.icon || ui.icon,
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
      {
        name: "Phantom",
        icon: PhantomWalletIcon,
        backgroundColor: "#c3bbff",
        titleColor: "#5345ba",
      },
      "https://phantom.com/download",
      new PhantomWalletAdapter()
    );
  }
}

export class Solflare extends Solana {
  public key: string = "SOLFLARE";

  constructor() {
    super(
      {
        name: "Solflare",
        icon: PhantomWalletIcon,
        backgroundColor: "#ffffc4",
        titleColor: "#e7d000",
      },
      "https://www.solflare.com/download/",
      new SolflareWalletAdapter()
    );
  }
}

export class Nightly extends Solana {
  public key: string = "NIGHTLY";

  constructor() {
    super(
      {
        name: "Nightly",
        icon: PhantomWalletIcon,
        backgroundColor: "#c3bbff",
        titleColor: "#5345ba",
      },
      "https://nightly.app/download",
      new NightlyWalletAdapter()
    );
  }
}
