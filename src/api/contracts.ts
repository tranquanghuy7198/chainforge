import { ContractAddress, NetworkCluster } from "@utils/constants";
import { makeRequest } from "./utils";

export const createContractAndTemplate = async (
  accessToken: string,
  name: string,
  abi: any,
  bytecode: string,
  networkClusters: NetworkCluster[],
  addresses: ContractAddress[],
  description?: string,
  flattenSource?: string
): Promise<[string, string]> => {
  const { templateId, contractId } = await makeRequest(
    "/api/contracts",
    "POST",
    {
      name,
      abi,
      bytecode,
      networkClusters,
      addresses,
      description,
      flattenSource,
    },
    accessToken
  );
  return [templateId, contractId];
};

export const updateContractAndTemplate = async (
  accessToken: string,
  templateId: string,
  contractId: string,
  name: string,
  abi: any,
  bytecode: string,
  networkClusters: NetworkCluster[],
  addresses: ContractAddress[],
  description?: string,
  flattenSource?: string
): Promise<[string, string]> => {
  await makeRequest(
    `/api/contracts/template/${templateId}/contract/${contractId}`,
    "PUT",
    {
      name,
      abi,
      bytecode,
      networkClusters,
      addresses,
      description,
      flattenSource,
    },
    accessToken
  );
  return [templateId, contractId];
};
