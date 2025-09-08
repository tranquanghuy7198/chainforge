import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContractTemplate, DeployedContract } from "@utils/constants";

interface ContractState {
  templates: ContractTemplate[];
  contracts: DeployedContract[];
  trendingContracts: DeployedContract[];
}

const initialState: ContractState = {
  templates: [],
  contracts: [],
  trendingContracts: [],
};

export const contractSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setTemplates(state, action: PayloadAction<ContractTemplate[]>) {
      state.templates = action.payload;
    },
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
