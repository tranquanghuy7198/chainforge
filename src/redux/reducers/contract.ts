import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DeployedContract } from "@utils/constants";

interface ContractState {
  contracts: DeployedContract[];
}

const initialState: ContractState = { contracts: [] };

export const contractSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setContracts(state, action: PayloadAction<DeployedContract[]>) {
      state.contracts = action.payload;
    },
  },
});

export const { setContracts } = contractSlice.actions;
export default contractSlice.reducer;
