import { listMyContracts, listTrendingContracts } from "@/api/contracts";
import { setContracts, setTrendingContracts } from "@/redux/reducers/contract";
import { useAppDispatch, useAppSelector } from "@redux/hook";
import { DeployedContract } from "@utils/constants";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@hooks/auth";

export const useFetchMyContracts = () => {
  const dispatch = useAppDispatch();
  const contracts = useAppSelector((state) => state.contract.contracts);
  const { callAuthenticatedApi } = useAuth();
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
            id: contract.contractId,
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
    [dispatch]
  );

  useEffect(() => {
    if (contracts.length === 0) fetchContracts(true);
  }, [fetchContracts, contracts.length]);

  return { contracts, fetchContracts, contractLoading };
};

export const useFetchTrendingContracts = () => {
  const dispatch = useAppDispatch();
  const trendingContracts = useAppSelector(
    (state) => state.contract.trendingContracts
  );
  const [trendingLoading, setTrendingLoading] = useState<boolean>(false);

  const fetchTrendingContracts = useCallback(
    async (force: boolean = false): Promise<DeployedContract[]> => {
      if (!force && trendingContracts.length > 0) return trendingContracts;

      try {
        setTrendingLoading(true);
        const fetchedTrendingContracts = await listTrendingContracts();
        const parsedTrendingContracts: DeployedContract[] =
          fetchedTrendingContracts.map((contract) => ({
            id: contract.contractId,
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
    if (trendingContracts.length === 0) fetchTrendingContracts(true);
  }, [fetchTrendingContracts, trendingContracts.length]);

  return { trendingContracts, fetchTrendingContracts, trendingLoading };
};
