import { sha256 } from "ethers";

export const CONTRACT_PARAM = "c";

export const buildContractHash = (
  templateId: string,
  blockchainId: string,
  address: string
): string => {
  const encoder = new TextEncoder();
  const contract = encoder.encode(`${templateId}|${blockchainId}|${address}`);
  return sha256(contract).slice(0, 16).replaceAll("0x", "");
};

export const buildShareableUrl = (
  baseUrl: string,
  templateId: string,
  blockchainId: string,
  address: string
): string => {
  const params = new URLSearchParams({
    [CONTRACT_PARAM]: buildContractHash(templateId, blockchainId, address),
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
