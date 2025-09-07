import {
  ContractAddress,
  DeployedContract,
  NetworkCluster,
} from "@utils/constants";
import { makeRequest } from "./utils";

type ContractResponse = {
  contractId: string;
  templateId: string;
  owner: string;
  name: string;
  description?: string;
  abi: any;
  bytecode: string;
  flattenSource?: string;
  networkClusters: NetworkCluster[];
  addresses: ContractAddress[];
};

export const listTrendingContracts = async (): Promise<ContractResponse[]> => {
  return await makeRequest("/api/contracts", "GET");
};

export const listMyContracts = async (
  accessToken: string
): Promise<ContractResponse[]> => {
  return await makeRequest(
    "/api/contracts/my-contracts",
    "GET",
    undefined,
    accessToken
  );
};

export const createContractAndTemplate = async (
  accessToken: string,
  contract: DeployedContract
): Promise<[string, string]> => {
  const { templateId, contractId } = await makeRequest(
    "/api/contracts",
    "POST",
    {
      name: contract.template.name,
      abi: contract.template.abi,
      bytecode: contract.template.bytecode,
      networkClusters: contract.template.networkClusters,
      addresses: contract.addresses,
      description: contract.template.description,
      flattenSource: contract.template.flattenSource,
    },
    accessToken
  );
  return [templateId, contractId];
};

export const updateContractAndTemplate = async (
  accessToken: string,
  contract: DeployedContract
): Promise<[string, string]> => {
  const { templateId, contractId } = await makeRequest(
    `/api/contracts/template/${contract.template.id}/contract/${contract.id}`,
    "PUT",
    {
      name: contract.template.name,
      abi: contract.template.abi,
      bytecode: contract.template.bytecode,
      networkClusters: contract.template.networkClusters,
      addresses: contract.addresses,
      description: contract.template.description,
      flattenSource: contract.template.flattenSource,
    },
    accessToken
  );
  return [templateId, contractId];
};

export const deleteContractById = async (accessToken: string, id: string) => {
  await makeRequest(`/api/contracts/${id}`, "DELETE", undefined, accessToken);
};
