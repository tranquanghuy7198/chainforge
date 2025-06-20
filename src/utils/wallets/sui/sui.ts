import {
  StandardWalletAdapter,
  WalletStandardAdapterProvider,
} from "@mysten/wallet-adapter-wallet-standard";
import { Wallet, WalletUI } from "../wallet";
import { NetworkCluster } from "../../constants";
import SuiIcon from "../../../assets/wallets/sui.svg";

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
    let allAdapters = new WalletStandardAdapterProvider().get();
    super({
      ui,
      installLink,
      networkCluster: NetworkCluster.Sui,
    });
    this.key = key;
    this.adapter = allAdapters.find((adapter) => adapter.name === ui.name);
  }
}

export class SuiWallet extends Sui {
  constructor() {
    super({
      ui: {
        name: SuiWalletNames.SUI_WALLET,
        icon: SuiIcon,
        backgroundColor: "#c5efff",
        titleColor: "#00a7d1",
      },
      installLink:
        "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
      key: "SuiWallet",
    });
  }
}
