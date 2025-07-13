import {
  StandardWalletAdapter,
  WalletStandardAdapterProvider,
} from "@mysten/wallet-adapter-wallet-standard";
import { Wallet, WalletUI } from "../wallet";
import { Blockchain, NetworkCluster } from "../../constants";
import SuiIcon from "../../../assets/wallets/sui.svg";
import { registerSlushWallet, SLUSH_WALLET_NAME } from "@mysten/slush-wallet";

// WARNING: Be careful when changing Sui wallet names here because those names must match the extension names
// https://github.com/suiet/wallet-kit/blob/main/packages/kit/src/hooks/useAvaibleWallets.ts#L20
const SuiWalletNames = {
  SUI_WALLET: "Sui Wallet",
  SUIET_WALLET: "Suiet",
  ETHOS_WALLET: "Ethos Wallet",
  SURF_WALLET: "Surf Wallet",
  GLASS_WALLET: "GlassWallet",
  MORPHIS_WALLET: "Morphis Wallet",
  MARTIAN_WALLET: "Martian Sui Wallet",
  ONEKEY_WALLET: "OneKey Wallet",
  SPACECY_WALLET: "Spacecy Sui Wallet",
};

class Sui extends Wallet {
  public key: string;
  public adapter?: StandardWalletAdapter;

  constructor({
    ui,
    installLink,
    key,
  }: {
    ui: WalletUI;
    installLink: string;
    key: string;
  }) {
    super({
      ui,
      installLink,
      networkCluster: NetworkCluster.Sui,
    });
    this.key = key;
  }

  public async connect(blockchain?: Blockchain): Promise<void> {
    const allAdapters = new WalletStandardAdapterProvider().get();
    this.adapter = allAdapters.find((adapter) => adapter.name === this.ui.name);
    if (!this.adapter)
      throw new Error(
        `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
      );
    await this.adapter.connect();
    const accounts = await this.adapter.getAccounts();
    if (accounts.length === 0)
      throw new Error(
        `${this.ui.name} is not detected in your browser. Install at ${this.installLink}`
      );
    this.address = accounts[0].address;
  }
}

export class Slush extends Sui {
  constructor() {
    const slushWallet = registerSlushWallet("Chainforge");
    super({
      ui: {
        name: slushWallet?.wallet.name ?? SLUSH_WALLET_NAME,
        icon: slushWallet?.wallet.icon ?? SuiIcon,
        backgroundColor: "#c5efff",
        titleColor: "#00a7d1",
      },
      installLink:
        "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
      key: "SuiWallet",
    });
  }
}
