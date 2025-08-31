import { CHAINFORGE_API } from "./constants";

export const makeRequest = async (
  endpoint: string,
  method: string,
  body?: any,
  accessToken?: string,
  contentType?: string
): Promise<any> => {
  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }; // default content type
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  if (contentType) headers["Content-Type"] = contentType;

  // Send request
  const response = await fetch(`${CHAINFORGE_API}${endpoint}`, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (response.status >= 400) throw new Error(JSON.stringify(response.json()));
  return await response.json();
};
