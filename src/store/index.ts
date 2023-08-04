import { configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	REHYDRATE,
	persistReducer,
	persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import uiSlice from "./slices/uiSlice";
import scheduleSlice from "./slices/scheduleSlice";

const persistConfig = {
	key: "root",
	storage,
};

const persistedUiReducer = persistReducer(persistConfig, uiSlice.reducer);
const persistedScheduleReducer = persistReducer(
	persistConfig,
	scheduleSlice.reducer
);

export const store = configureStore({
	reducer: {
		ui: persistedUiReducer,
		schedule: persistedScheduleReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
