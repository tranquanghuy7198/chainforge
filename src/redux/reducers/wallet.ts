import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MetaMask } from "@utils/wallets/ethereum/metamask";
import { Wallet } from "@utils/wallets/wallet";
import { Phantom, Solflare } from "@utils/wallets/solana/solana";
import { Slush } from "@utils/wallets/sui/sui";
import { Petra } from "@/utils/wallets/aptos/aptos";

interface WalletState {
  wallets: Record<string, Wallet>;
}

const initialState: WalletState = {
  wallets: Object.fromEntries(
    [
      new MetaMask(),
      new Phantom(),
      new Solflare(),
      new Slush(),
      new Petra(),
    ].map((wallet) => [wallet.key, wallet])
  ),
};

export const walletSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {
    updateWallet(state, action: PayloadAction<Wallet>) {
      state.wallets[action.payload.key] = action.payload;
    },
  },
});

export const { updateWallet } = walletSlice.actions;
export default walletSlice.reducer;
