import { sha256 } from "ethers";
import { NetworkCluster } from "@utils/constants";
import { normalizeAddr } from "@utils/utils";

export const CONTRACT_PARAM = "c";

export const buildContractHash = (
  templateId: string,
  blockchainId: string,
  address: string,
  networkCluster?: NetworkCluster
): string => {
  const encoder = new TextEncoder();
  const contract = encoder.encode(
    `${templateId}|${blockchainId}|${normalizeAddr(address, networkCluster)}`
  );
  return sha256(contract).slice(0, 16).replaceAll("0x", "");
};

export const buildShareableUrl = (
  baseUrl: string,
  templateId: string,
  blockchainId: string,
  address: string,
  networkCluster?: NetworkCluster
): string => {
  const params = new URLSearchParams({
    [CONTRACT_PARAM]: buildContractHash(
      templateId,
      blockchainId,
      address,
      networkCluster
    ),
  }).toString();

  // TODO: Remove this when possible
  if (baseUrl.includes("#")) {
    const [origin, hash] = baseUrl.split("#", 2);
    return `${origin}#${hash}${hash.includes("?") ? "&" : "?"}${params}`;
  }

  const url = new URL(baseUrl);
  url.search = params;
  return url.toString();
};
