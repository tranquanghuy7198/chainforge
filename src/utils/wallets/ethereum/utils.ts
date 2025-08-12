import { Blockchain } from "@utils/constants";

export type EthereumExtra = { payment?: string };

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
