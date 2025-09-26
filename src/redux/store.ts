import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "@redux/reducers/wallet";
import blockchainReducer from "@redux/reducers/blockchain";
import contractReducer from "@redux/reducers/contract";
import profileReducer from "@redux/reducers/account";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    blockchain: blockchainReducer,
    contract: contractReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
