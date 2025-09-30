import { NetworkCluster } from "@utils/constants";

export const capitalize = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const shorten = (value: string): string => {
  if (value.length > 14) return `${value.slice(0, 8)}...${value.slice(-6)}`;
  return value;
};

export const concat = (values: string[]): string => {
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
};

export const normalizeAddr = (
  address: string,
  networkCluster?: NetworkCluster
): string => {
  if (
    networkCluster &&
    [
      NetworkCluster.Ethereum,
      NetworkCluster.KardiaChain,
      NetworkCluster.Klaytn,
      NetworkCluster.Ronin,
    ].includes(networkCluster)
  )
    return address.toLowerCase();
  return address;
};
