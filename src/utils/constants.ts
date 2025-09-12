export const PRIMARY_COLOR = "#1ABC9C";

export const ADDRESS_PATTERN = "[[address]]";
export const TX_PATTERN = "[[tx]]";

export enum NetworkCluster {
  Ethereum = "ethereum",
  Klaytn = "klaytn",
  KardiaChain = "kardiachain",
  Ronin = "ronin",
  Solana = "solana",
  Sui = "sui",
  Cosmos = "cosmos",
  FlowChain = "flowchain",
}

export enum AbiAction {
  Deploy = "deploy",
  Read = "read",
  Write = "write",
}

export type Blockchain = {
  id: string;
  code: string;
  chainId: string;
  globalId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  addressUrl: string;
  txUrl: string;
  nativeDenom: string;
  nativeToken: string;
  nativeDecimal: number;
  bech32Prefix?: string;
  networkCluster: NetworkCluster;
  logo: string;
  isTestnet: boolean;
};

export type ContractTemplate = {
  id: string;
  name: string;
  description?: string;
  abi: any;
  bytecode: string;
  flattenSource?: string;
  programKeypair?: number[];
  networkClusters: NetworkCluster[];
};

export type ContractAddress = {
  blockchainId: string;
  address: string;
  package?: string;
  publicity: boolean;
};

export type DeployedContract = {
  id: string;
  template: ContractTemplate;
  addresses: ContractAddress[];
};

type EvmAbiField = {
  internalType: string;
  name: string;
  type: string;
};

export type EvmAbiFunction = {
  name?: string; // No name for constructor
  inputs: EvmAbiField[];
  outputs?: any; // No outputs for constructor
  stateMutability: "view" | "payable" | "nonpayable";
  type: "constructor" | "function" | "event";
  anonymous?: boolean; // For events only
};

export type EvmAbi = EvmAbiFunction[];

export type TxResponse = {
  walletAddress: string;
  networkCluster: NetworkCluster;
  contractAddress?: string; // Deploy
  txHash?: string; // Deploy + Write
  data?: string; // Read
};
