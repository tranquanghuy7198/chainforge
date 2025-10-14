import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";

export type CosmosExtra = {
  // Deploy + Write
  payment?: string;

  // Deploy
  contractName?: string;
  codeId?: number;
  admin?: string;
  accessType?: AccessType;
  accessList?: string[];
};
