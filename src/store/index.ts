import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
