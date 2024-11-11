import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, ChatState } from '@/types';

const initialState: ChatState = {
  messages: [],
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
    },
    setError: (state: ChatState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state: ChatState) => {
      state.messages = [];
    },
  },
});

export const { setLoading, addMessage, setError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
