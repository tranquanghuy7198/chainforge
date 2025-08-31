import { NetworkCluster } from "@utils/constants";
import { makeRequest } from "@api/utils";

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export const requestChallenge = async (
  address: string
): Promise<[number, string, string]> => {
  const { timestamp, nonce, challenge } = await makeRequest(
    "/token/challenge",
    "POST",
    { address }
  );
  return [timestamp, nonce, challenge];
};

export const registerWithWallet = async (
  address: string,
  timestamp: number,
  nonce: string,
  signature: string,
  networkCluster: NetworkCluster
) => {
  await makeRequest("/token/register/wallet", "POST", {
    address,
    timestamp,
    nonce,
    signature,
    networkCluster,
  });
};

export const authWithWallet = async (
  address: string,
  timestamp: number,
  nonce: string,
  signature: string,
  networkCluster: NetworkCluster
): Promise<AuthResponse> => {
  return await makeRequest("/token", "POST", {
    wallet_address: address,
    timestamp,
    nonce,
    signature,
    network_cluster: networkCluster,
  });
};

export const linkWallet = async (
  address: string,
  timestamp: number,
  nonce: string,
  signature: string,
  networkCluster: NetworkCluster,
  accessToken: string
) => {
  await makeRequest(
    "/token/link/wallet",
    "POST",
    { address, timestamp, nonce, signature, networkCluster },
    accessToken
  );
};
