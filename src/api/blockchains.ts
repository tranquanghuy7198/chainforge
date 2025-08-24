import { Blockchain } from "@utils/constants";
import { CHAINFORGE_API } from "@api/constants";

export const fetchBlockchains = async (): Promise<Blockchain[]> => {
  const response = await fetch(`${CHAINFORGE_API}/blockchains`, {
    method: "GET",
    credentials: "include",
  });
  return await response.json();
};
