import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DeployedContract } from "@utils/constants";

interface ContractState {
  contracts: DeployedContract[];
  trendingContracts: DeployedContract[];
}

const initialState: ContractState = { contracts: [], trendingContracts: [] };

export const contractSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setContracts(state, action: PayloadAction<DeployedContract[]>) {
      state.contracts = action.payload;
    },
    setTrendingContracts(state, action: PayloadAction<DeployedContract[]>) {
      state.trendingContracts = action.payload;
    },
  },
});

export const { setContracts, setTrendingContracts } = contractSlice.actions;
export default contractSlice.reducer;
