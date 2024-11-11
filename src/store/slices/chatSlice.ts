import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, ChatState } from '../../types';

// Local storage key for messages
const MESSAGES_STORAGE_KEY = 'writing_assistant_messages';

// Local storage utilities
const saveMessagesToStorage = (messages: Message[]) => {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
};

const loadMessagesFromStorage = (): Message[] => {
  const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
  return storedMessages ? JSON.parse(storedMessages) : [];
};

const initialState: ChatState = {
  messages: loadMessagesFromStorage(),
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state: ChatState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addMessage: (state: ChatState, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      saveMessagesToStorage(state.messages);
    },
    setError: (state: ChatState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state: ChatState) => {
      state.messages = [];
      saveMessagesToStorage([]);
    },
  },
});

export const { setLoading, addMessage, setError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;

// Utility function to create a new message
export const createMessage = (content: string, role: 'user' | 'assistant'): Message => ({
  id: crypto.randomUUID(),
  content,
  role,
  timestamp: Date.now(),
});
