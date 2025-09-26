import { Blockchain } from "@utils/constants";
import { makeRequest } from "@api/utils";

export const fetchBlockchains = async (): Promise<Blockchain[]> => {
  return await makeRequest("/api/blockchains", "GET");
};
