import {
  ContractAddress,
  ContractTemplate,
  DeployedContract,
  NetworkCluster,
} from "@utils/constants";
import { makeRequest } from "@api/utils";

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

export const listPopularContracts = async (): Promise<ContractResponse[]> => {
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
): Promise<string> => {
  const { templateId } = await makeRequest(
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
  return templateId;
};

export const updateTemplate = async (
  accessToken: string,
  template: ContractTemplate
) => {
  return await makeRequest(
    `/api/contracts/templates/${template.id}`,
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
): Promise<string> => {
  const { templateId } = await makeRequest(
    `/api/contracts/${contract.template.id}`,
    "PUT",
    {
      name: contract.template.name,
      abi: contract.template.abi,
      bytecode: contract.template.bytecode,
      networkClusters: contract.template.networkClusters,
      addresses: contract.addresses.map((address) => ({
        ...address,
        templateId: contract.template.id,
      })),
      description: contract.template.description,
      flattenSource: contract.template.flattenSource,
    },
    accessToken
  );
  return templateId;
};

export const addContractAddress = async (
  accessToken: string,
  templateId: string,
  blockchainId: string,
  address: string,
  publicity: boolean
) => {
  await makeRequest(
    `/api/contracts/templates/${templateId}/addresses`,
    "PATCH",
    { addresses: [{ templateId, blockchainId, address, publicity }] },
    accessToken
  );
};

export const deleteTemplateById = async (accessToken: string, id: string) => {
  await makeRequest(
    `/api/contracts/templates/${id}`,
    "DELETE",
    undefined,
    accessToken
  );
};

export const deleteContractAddresses = async (
  accessToken: string,
  templateId: string
) => {
  await makeRequest(
    `/api/contracts/templates/${templateId}/addresses`,
    "DELETE",
    undefined,
    accessToken
  );
};
