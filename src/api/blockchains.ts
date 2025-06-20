import { Blockchain } from "../utils/constants";
import { DATABASE, TABLE } from "./constants";

export const fetchBlockchains = async (): Promise<Blockchain[]> => {
  const response = await fetch(`https://opensheet.elk.sh/${DATABASE}/${TABLE}`);
  const chains: Record<string, any>[] = await response.json();
  return chains.map((chain) => {
    const blockchain: Blockchain = {
      id: chain.id,
      code: chain.code,
      chainId: chain.chain_id,
      globalId: chain.global_id,
      name: chain.name,
      rpcUrl: chain.rpc_url,
      explorerUrl: chain.explorer_url,
      nativeDenom: chain.native_denom,
      nativeToken: chain.native_token,
      nativeDecimal: chain.native_decimal,
      bech32Prefix: chain.bech32_prefix,
      networkCluster: chain.network_cluster,
      logo: chain.logo,
      isTestnet: chain.is_testnet,
    };
    return blockchain;
  });
};
