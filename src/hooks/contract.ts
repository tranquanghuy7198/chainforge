import {
  listMyContracts,
  listMyTemplates,
  listPopularContracts,
} from "@api/contracts";
import {
  setContracts,
  setTemplates,
  setTrendingContracts,
} from "@redux/reducers/contract";
import { useAppDispatch, useAppSelector } from "@redux/hook";
import { ContractTemplate, DeployedContract } from "@utils/constants";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@hooks/auth";

export const useFetchMyTemplates = () => {
  const dispatch = useAppDispatch();
  const templates = useAppSelector((state) => state.contract.templates);
  const { session, callAuthenticatedApi } = useAuth();
  const [templateLoading, setTemplateLoading] = useState<boolean>(false);

  const fetchTemplates = useCallback(
    async (force: boolean = false): Promise<ContractTemplate[]> => {
      if (!force && templates.length > 0) return templates;
      try {
        setTemplateLoading(true);
        const fetchedTemplates = await callAuthenticatedApi(listMyTemplates);
        if (!fetchedTemplates) return [];
        const contractTemplates: ContractTemplate[] = fetchedTemplates!.map(
          (template) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            abi: template.abi,
            bytecode: template.bytecode,
            flattenSource: template.flattenSource,
            networkClusters: template.networkClusters,
          })
        );
        dispatch(setTemplates(contractTemplates));
        return contractTemplates;
      } finally {
        setTemplateLoading(false);
      }
    },
    [session, dispatch]
  );

  useEffect(() => {
    if (templates.length === 0) fetchTemplates(true);
  }, [fetchTemplates, templates.length]);

  return { templates, fetchTemplates, templateLoading };
};

export const useFetchMyContracts = () => {
  const dispatch = useAppDispatch();
  const contracts = useAppSelector((state) => state.contract.contracts);
  const { session, callAuthenticatedApi } = useAuth();
  const [contractLoading, setContractLoading] = useState<boolean>(false);

  const fetchContracts = useCallback(
    async (force: boolean = false): Promise<DeployedContract[]> => {
      if (!force && contracts.length > 0) return contracts;
      try {
        setContractLoading(true);
        const fetchedContracts = await callAuthenticatedApi(listMyContracts);
        if (!fetchContracts) return [];
        const deployedContracts: DeployedContract[] = fetchedContracts!.map(
          (contract) => ({
            template: {
              id: contract.templateId,
              name: contract.name,
              description: contract.description,
              abi: contract.abi,
              bytecode: contract.bytecode,
              flattenSource: contract.flattenSource,
              networkClusters: contract.networkClusters,
            },
            addresses: contract.addresses,
          })
        );
        dispatch(setContracts(deployedContracts));
        return deployedContracts;
      } finally {
        setContractLoading(false);
      }
    },
    [session, dispatch]
  );

  useEffect(() => {
    if (contracts.length === 0) fetchContracts(true);
  }, [fetchContracts, contracts.length]);

  return { contracts, fetchContracts, contractLoading };
};

export const useFetchPopularContracts = () => {
  const dispatch = useAppDispatch();
  const trendingContracts = useAppSelector(
    (state) => state.contract.trendingContracts
  );
  const [trendingLoading, setTrendingLoading] = useState<boolean>(false);

  const fetchPopularContracts = useCallback(
    async (force: boolean = false): Promise<DeployedContract[]> => {
      if (!force && trendingContracts.length > 0) return trendingContracts;

      try {
        setTrendingLoading(true);
        const fetchedTrendingContracts = await listPopularContracts();
        const parsedTrendingContracts: DeployedContract[] =
          fetchedTrendingContracts.map((contract) => ({
            template: {
              id: contract.templateId,
              name: contract.name,
              description: contract.description,
              abi: contract.abi,
              bytecode: contract.bytecode,
              flattenSource: contract.flattenSource,
              networkClusters: contract.networkClusters,
            },
            addresses: contract.addresses,
          }));
        dispatch(setTrendingContracts(parsedTrendingContracts));
        return parsedTrendingContracts;
      } finally {
        setTrendingLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (trendingContracts.length === 0) fetchPopularContracts(true);
  }, [fetchPopularContracts, trendingContracts.length]);

  return {
    trendingContracts,
    fetchPopularContracts,
    trendingLoading,
  };
};
