import { useCallback } from "react";
import useLocalStorageState from "use-local-storage-state";
import { refresh } from "@api/auth";
import { ApiError } from "@api/utils";

export type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number; // UNIX timestamp in seconds
};

export const AUTH_KEY = "auth";

type ApiCall<T, Args extends any[]> = (
  accessToken: string,
  ...args: Args
) => Promise<T>;

export function useAuth() {
  const [session, setSession] = useLocalStorageState<Session | null>(AUTH_KEY, {
    defaultValue: null,
  });

  const callAuthenticatedApi = useCallback(
    async <T, Args extends any[]>(
      apiCall: ApiCall<T, Args>,
      ...args: Args
    ): Promise<T | null> => {
      if (!session) return null;
      try {
        return await apiCall(session.accessToken, ...args);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          try {
            const authResponse = await refresh(session.refreshToken);
            setSession({
              accessToken: authResponse.access_token,
              refreshToken: authResponse.refresh_token,
              accessTokenExpires:
                Math.floor(Date.now() / 1000) + authResponse.expires_in,
            });
            return await apiCall(authResponse.access_token, ...args);
          } catch (refreshErr) {
            setSession(null); // This makes AuthModal popup to auth again
            return null;
          }
        } else throw error;
      }
    },
    [session, setSession]
  );

  // Logout
  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  return { session, callAuthenticatedApi, logout };
}
