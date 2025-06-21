export const CONTRACT_TEMPLATE_KEY = "contract-templates";

export enum NetworkCluster {
  Ethereum = "ethereum",
  Klaytn = "klaytn",
  KardiaChain = "kardiachain",
  Ronin = "ronin",
  Solana = "solana",
  Sui = "sui",
  Cosmos = "cosmos",
  FlowChain = "flowchain",
  ImmutableX = "immutablex",
}

export type Blockchain = {
  id: string;
  code: string;
  chainId: string;
  globalId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeDenom: string;
  nativeToken: string;
  nativeDecimal: number;
  bech32Prefix?: string;
  networkCluster: NetworkCluster;
  logo: string;
  isTestnet: boolean;
};

export type ContractTemplate = {
  name: string;
  abi: Record<string, any>[];
  bytecode: string;
  flattenSource: string;
  networkClusters: NetworkCluster[];
};

export type DeployedContract = {
  name: string;
  abi: Record<string, any>[];
  addresses: { blockchainId: string; address: string; package?: string }[];
};
