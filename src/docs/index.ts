import { NetworkCluster } from "@utils/constants";
import urlJoin from "url-join";

const CHAINFORGE_DOC = "https://tranquanghuy7198.github.io/chainforge-doc/docs";

export enum DocType {
  GenerateAbiBytecode = "generate-abi-bytecode",
  InteractContract = "interact-with-contract",
}

export const getDocLink = (
  networkCluster: NetworkCluster,
  docType: DocType
) => {
  return urlJoin(CHAINFORGE_DOC, networkCluster, docType);
};
