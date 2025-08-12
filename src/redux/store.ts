import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "@redux/reducers/wallet";
import blockchainReducer from "@redux/reducers/blockchain";

export const store = configureStore({
  reducer: { wallet: walletReducer, blockchain: blockchainReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
