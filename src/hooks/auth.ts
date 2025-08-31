import { Blockchain } from "@utils/constants";
import { authWithWallet, requestChallenge } from "@api/auth";
import { Wallet } from "@utils/wallets/wallet";
import { useState } from "react";

type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
};

export function useAuth() {
  const [session, setSession] = useState<Session>();

  const login = async (wallet: Wallet, blockchain?: Blockchain) => {
    // Check current session

    // Connect wallet first
    await wallet.connect(blockchain);
    const address = wallet.address;
    if (!address) throw new Error(`Cannot connect to ${wallet.ui.name}`);

    // Sign and verify challenge
    const [timestamp, nonce, challenge] = await requestChallenge(address);
    const signature = await wallet.signMessage(challenge);
    const authResponse = await authWithWallet(
      address,
      timestamp,
      nonce,
      signature,
      wallet.networkCluster
    );

    // Save session
    setSession({
      accessToken: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      accessTokenExpires:
        Math.floor(Date.now() / 1000) + authResponse.expires_in,
    });
  };

  const logout = () => {
    setSession(undefined);
  };

  return { session, login, logout };
}
