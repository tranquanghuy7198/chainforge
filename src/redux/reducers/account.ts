import { ProfileResponse } from "@/api/account";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  profile: ProfileResponse | null;
}

const initialState: ProfileState = { profile: null };

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<ProfileResponse | null>) {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
