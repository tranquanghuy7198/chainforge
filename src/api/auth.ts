import { NetworkCluster } from "@/utils/constants";
import { CHAINFORGE_API } from "@api/constants";

export const requestChallenge = async (
  address: string
): Promise<[number, string, string]> => {
  const response = await fetch(`${CHAINFORGE_API}/token/challenge`, {
    method: "POST",
    body: JSON.stringify({ address }),
    credentials: "include",
  });
  if (response.status >= 400) throw new Error(JSON.stringify(response.json()));
  const { timestamp, nonce, challenge } = await response.json();
  return [timestamp, nonce, challenge];
};

export const registerWithWallet = async (
  address: string,
  timestamp: number,
  nonce: string,
  signature: string,
  networkCluster: NetworkCluster
) => {
  const response = await fetch(`${CHAINFORGE_API}/token/register/wallet`, {
    method: "POST",
    body: JSON.stringify({
      address,
      timestamp,
      nonce,
      signature,
      networkCluster,
    }),
    credentials: "include",
  });
  if (response.status >= 400) throw new Error(JSON.stringify(response.json()));
};
