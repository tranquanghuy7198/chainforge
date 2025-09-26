import { getProfile, ProfileResponse } from "@api/account";
import { useAppDispatch, useAppSelector } from "@redux/hook";
import { useCallback, useEffect } from "react";
import { useAuth } from "@hooks/auth";
import { setProfile } from "@redux/reducers/account";

export const useFetchProfile = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const { session, callAuthenticatedApi } = useAuth();

  const fetchProfile = useCallback(
    async (force: boolean = false): Promise<ProfileResponse | null> => {
      if (!force && profile) return profile;
      const fetchedProfile = await callAuthenticatedApi(getProfile);
      dispatch(setProfile(fetchedProfile));
      return fetchedProfile;
    },
    [session, dispatch]
  );

  useEffect(() => {
    if (!profile) fetchProfile(true);
  }, [fetchProfile, profile]);

  return { profile, fetchProfile };
};
