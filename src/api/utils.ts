import { CHAINFORGE_API } from "@api/constants";

type ApiErrorResponse = {
  error: string; // Overall error
  message: string; // Detailed description
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

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

  // Handle response
  const responseData = await response.json();
  if (response.status >= 400) {
    const errorData = responseData as ApiErrorResponse;
    throw new ApiError(
      response.status,
      errorData.message || errorData.error || JSON.stringify(errorData)
    );
  }
  return responseData;
};
