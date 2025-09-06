import { listMyContracts } from "@/api/contracts";
import { setContracts } from "@/redux/reducers/contract";
import { useAppDispatch, useAppSelector } from "@redux/hook";
import { DeployedContract } from "@utils/constants";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@hooks/auth";

export const useFetchContracts = () => {
  const dispatch = useAppDispatch();
  const contracts = useAppSelector((state) => state.contract.contracts);
  const { session, refreshToken } = useAuth();
  const [contractLoading, setContractLoading] = useState<boolean>(false);

  const fetchContracts = useCallback(
    async (force: boolean = false): Promise<DeployedContract[]> => {
      if (!session) throw new Error("Unauthenticated");
      if (!force && contracts.length > 0) return contracts;

      try {
        setContractLoading(true);
        const fetchedContracts = await listMyContracts(session.accessToken);
        const deployedContracts: DeployedContract[] = fetchedContracts.map(
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
