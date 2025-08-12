import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Blockchain } from "@utils/constants";

interface BlockchainState {
  blockchains: Blockchain[];
}

const initialState: BlockchainState = { blockchains: [] };

export const blockchainSlice = createSlice({
  name: "blockchains",
  initialState,
  reducers: {
    setBlockchains(state, action: PayloadAction<Blockchain[]>) {
      state.blockchains = action.payload;
    },
  },
});

export const { setBlockchains } = blockchainSlice.actions;
export default blockchainSlice.reducer;
