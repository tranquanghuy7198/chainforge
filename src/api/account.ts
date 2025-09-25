import { AuthMethod } from "@api/auth";
import { makeRequest } from "@api/utils";

export type ProfileResponse = {
  accountId: string;
  username: string;
  credentials: {
    id: string;
    method: AuthMethod;
    credentialId: string;
  }[];
};

export const getProfile = async (
  accessToken: string
): Promise<ProfileResponse> => {
  return await makeRequest("/api/account", "GET", undefined, accessToken);
};
