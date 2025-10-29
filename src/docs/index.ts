import { NetworkCluster } from "@utils/constants";
import urlJoin from "url-join";

const DOC_URL = "https://tranquanghuy7198.github.io/kontraxhub-doc/docs";

export enum DocType {
  AbiBytecode = "generate-abi-bytecode",
  CallContract = "interact-with-contract",
}

export const docUrl = (networkCluster: NetworkCluster, docType: DocType) => {
  return urlJoin(DOC_URL, networkCluster, docType);
};
