export const TEMPLATE_ID_PARAM = "templateId";
export const BLOCKCHAIN_ID_PARAM = "blockchainId";
export const ADDRESS_PARAM = "address";

export const buildShareableUrl = (
  baseUrl: string,
  templateId: string,
  blockchainId: string,
  address: string
) => {
  const params = new URLSearchParams({
    [TEMPLATE_ID_PARAM]: templateId,
    [BLOCKCHAIN_ID_PARAM]: blockchainId,
    [ADDRESS_PARAM]: address,
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
