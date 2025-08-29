import { CHAINFORGE_API } from "./constants";

export const makeRequest = async (
  endpoint: string,
  method: string,
  body: any,
  accessToken?: string
): Promise<any> => {
  const response = await fetch(`${CHAINFORGE_API}${endpoint}`, {
    method: method,
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (response.status >= 400) throw new Error(JSON.stringify(response.json()));
  return await response.json();
};
