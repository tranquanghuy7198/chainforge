import { Blockchain } from "../../constants";

export const toMetaMaskCompatibility = (blockchain: Blockchain) => {
  return {
    chainId: blockchain.chainId,
    chainName: blockchain.name,
    nativeCurrency: {
      name: blockchain.nativeToken,
      symbol: blockchain.nativeToken,
      decimals: blockchain.nativeDecimal,
    },
    rpcUrls: [blockchain.rpcUrl],
    blockExplorerUrls: [blockchain.explorerUrl],
  };
};
