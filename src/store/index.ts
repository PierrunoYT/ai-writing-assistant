import { configureStore, Middleware } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';
import modeReducer from './slices/modeSlice';
import markdownReducer from './slices/markdownSlice';
import documentReducer from './slices/documentSlice';
import settingsReducer from './slices/settingsSlice';
import { saveConversationsToFile, saveActiveConversationToFile, saveDocumentsToFile } from '../utils/fileStorage';

const devToolsOptions = {
  name: 'Writing Assistant Store',
  trace: true,
  traceLimit: 25
};

// Middleware to save state changes to storage
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  // Check if chat state has changed
  if (prevState.chat.conversations !== nextState.chat.conversations) {
    saveConversationsToFile(nextState.chat.conversations);
  }
  
  // Check if active conversation has changed
  if (prevState.chat.activeConversationId !== nextState.chat.activeConversationId) {
    saveActiveConversationToFile(nextState.chat.activeConversationId);
  }

  // Check if documents have changed
  if (prevState.document?.documents !== nextState.document?.documents) {
    saveDocumentsToFile(nextState.document.documents);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    theme: themeReducer,
    mode: modeReducer,
    markdown: markdownReducer,
    document: documentReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production' ? devToolsOptions : false
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
