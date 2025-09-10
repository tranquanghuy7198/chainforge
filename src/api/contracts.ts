import {
  ContractAddress,
  ContractTemplate,
  DeployedContract,
  NetworkCluster,
} from "@utils/constants";
import { makeRequest } from "./utils";

type TemplateResponse = {
  id: string;
  owner: string;
  name: string;
  description?: string;
  abi: any;
  bytecode: string;
  flattenSource?: string;
  networkClusters: NetworkCluster[];
};

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

export const listMyTemplates = async (
  accessToken: string
): Promise<TemplateResponse[]> => {
  return await makeRequest(
    "/api/contracts/my-templates",
    "GET",
    undefined,
    accessToken
  );
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

export const createTemplate = async (
  accessToken: string,
  template: ContractTemplate
) => {
  return await makeRequest(
    "/api/contracts/templates",
    "POST",
    {
      name: template.name,
      abi: template.abi,
      bytecode: template.bytecode,
      networkClusters: template.networkClusters,
      description: template.description,
      flattenSource: template.flattenSource,
    },
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

export const updateTemplate = async (
  accessToken: string,
  template: ContractTemplate
) => {
  return await makeRequest(
    `/api/contracts/template/${template.id}`,
    "PUT",
    {
      name: template.name,
      abi: template.abi,
      bytecode: template.bytecode,
      networkClusters: template.networkClusters,
      description: template.description,
      flattenSource: template.flattenSource,
    },
    accessToken
  );
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

export const addContractAddress = async (
  accessToken: string,
  templateId: string,
  blockchainId: string,
  address: string
) => {
  await makeRequest(
    `/api/contracts/template/${templateId}/contract`,
    "PATCH",
    { contractAddress: { blockchainId, address } },
    accessToken
  );
};

export const deleteTemplateById = async (accessToken: string, id: string) => {
  await makeRequest(
    `/api/contracts/template/${id}`,
    "DELETE",
    undefined,
    accessToken
  );
};

export const deleteContractById = async (accessToken: string, id: string) => {
  await makeRequest(`/api/contracts/${id}`, "DELETE", undefined, accessToken);
};
