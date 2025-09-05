import { Blockchain } from "@utils/constants";
import { useAppDispatch, useAppSelector } from "@redux/hook";
import { useCallback, useEffect, useState } from "react";
import { fetchBlockchains } from "@api/blockchains";
import { setBlockchains } from "@redux/reducers/blockchain";

export const useFetchBlockchains = () => {
  const dispatch = useAppDispatch();
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [blockchainLoading, setBlockchainLoading] = useState<boolean>(false);

  const fetchChains = useCallback(
    async (force: boolean = false): Promise<Blockchain[]> => {
      if (!force && blockchains.length > 0) return blockchains;

      try {
        setBlockchainLoading(true);
        const chains = await fetchBlockchains();
        dispatch(setBlockchains(chains));
        return chains;
      } finally {
        setBlockchainLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (blockchains.length === 0) fetchChains(true);
  }, [fetchChains, blockchains.length]);

  return { blockchains, fetchChains, blockchainLoading };
};
