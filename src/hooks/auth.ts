import { useCallback, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import { Blockchain } from "@utils/constants";
import { authWithWallet, requestChallenge, refresh } from "@api/auth";
import { Wallet } from "@utils/wallets/wallet";

export type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number; // UNIX timestamp in seconds
};

const AUTH_KEY = "auth";

export function useAuth() {
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useLocalStorageState<Session | null>(AUTH_KEY, {
    defaultValue: null,
  });

  // Refresh access token if expired
  const refreshToken = useCallback(async () => {
    if (!session) return null;

    const isExpired = session.accessTokenExpires * 1000 <= Date.now();
    if (!isExpired) return session.accessToken;

    try {
      const refreshResponse = await refresh(session.refreshToken);
      setSession({
        accessToken: refreshResponse.access_token,
        refreshToken: refreshResponse.refresh_token ?? session.refreshToken,
        accessTokenExpires:
          Math.floor(Date.now() / 1000) + refreshResponse.expires_in,
      });
      return refreshResponse.access_token;
    } catch (err) {
      console.error("Failed to refresh token:", err);
      setSession(null);
      return null;
    }
  }, [session, setSession]);

  // Login with wallet signature
  const login = useCallback(
    async (wallet?: Wallet, blockchain?: Blockchain) => {
      // Check to start authenticating
      if (session) return;
      if (!wallet) throw new Error("Wallet not connected");
      setAuthLoading(true);

      // Connect wallet
      await wallet.connect(blockchain);
      const address = wallet.address;
      if (!address) throw new Error(`Cannot connect to ${wallet.ui.name}`);

      // Get challenge, sign it, authenticate
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
      setAuthLoading(false);
    },
    [session, setSession]
  );

  // Logout
  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  return {
    session,
    authLoading,
    login,
    logout,
    refreshToken,
  };
}
