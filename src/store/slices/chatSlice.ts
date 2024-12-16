import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Message, ChatState, Conversation } from '../../types';
import {
  saveConversationsToFile,
  saveActiveConversationToFile,
  loadConversationsFromFile,
  loadActiveConversationFromFile,
  isValidConversation
} from '../../utils/fileStorage';

// Create initial conversation if none exists
const createInitialConversation = (): Conversation => ({
  id: crypto.randomUUID(),
  title: 'New Conversation',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Initial state with default values
const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isLoading: true,
  error: null,
};

// Async thunks for storage operations
export const initializeStore = createAsyncThunk(
  'chat/initialize',
  async () => {
    try {
      const [conversations, activeId] = await Promise.all([
        loadConversationsFromFile(),
        loadActiveConversationFromFile()
      ]);
      
      const validConversations = conversations.length > 0 ? conversations : [createInitialConversation()];
      const validActiveId = activeId || validConversations[0].id;
      
      return {
        conversations: validConversations,
        activeId: validActiveId
      };
    } catch (error) {
      console.error('Failed to initialize store:', error);
      const defaultConversation = createInitialConversation();
      return {
        conversations: [defaultConversation],
        activeId: defaultConversation.id
      };
    }
  }
);

export const saveConversations = createAsyncThunk(
  'chat/saveConversations',
  async (conversations: Conversation[]) => {
    await saveConversationsToFile(conversations);
    return conversations;
  }
);

export const saveActiveConversation = createAsyncThunk(
  'chat/saveActiveConversation',
  async (conversationId: string) => {
    await saveActiveConversationToFile(conversationId);
    return conversationId;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state: ChatState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addMessage: (state: ChatState, action: PayloadAction<Message>) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        conversation.messages.push(action.payload);
        conversation.updatedAt = Date.now();
        // Update conversation title based on first user message if untitled
        if (conversation.title === 'New Conversation' && action.payload.role === 'user') {
          conversation.title = action.payload.content.slice(0, 30) + (action.payload.content.length > 30 ? '...' : '');
        }
      }
    },
    updateLastMessage: (state: ChatState, action: PayloadAction<Message>) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation && conversation.messages.length > 0) {
        conversation.messages[conversation.messages.length - 1] = action.payload;
        conversation.updatedAt = Date.now();
      }
    },
    setError: (state: ChatState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    createNewConversation: (state: ChatState) => {
      const newConversation = createInitialConversation();
      state.conversations.unshift(newConversation);
      state.activeConversationId = newConversation.id;
    },
    setActiveConversation: (state: ChatState, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    deleteConversation: (state: ChatState, action: PayloadAction<string>) => {
      const index = state.conversations.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.conversations.splice(index, 1);
        // If we deleted the active conversation, set a new active conversation
        if (state.activeConversationId === action.payload) {
          if (state.conversations.length === 0) {
            const newConversation = createInitialConversation();
            state.conversations.push(newConversation);
            state.activeConversationId = newConversation.id;
          } else {
            state.activeConversationId = state.conversations[0].id;
          }
        }
      }
    },
    clearCurrentConversation: (state: ChatState) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        conversation.messages = [];
        conversation.title = 'New Conversation';
        conversation.updatedAt = Date.now();
      }
    },
    renameConversation: (state: ChatState, action: PayloadAction<{ id: string; title: string }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.id);
      if (conversation) {
        conversation.title = action.payload.title;
        conversation.updatedAt = Date.now();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize store
      .addCase(initializeStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeStore.fulfilled, (state, action) => {
        state.conversations = action.payload.conversations;
        state.activeConversationId = action.payload.activeId;
        state.isLoading = false;
      })
      .addCase(initializeStore.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to initialize store';
        state.isLoading = false;
      })
      // Save conversations
      .addCase(saveConversations.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save conversations';
      })
      // Save active conversation
      .addCase(saveActiveConversation.fulfilled, (state, action) => {
        state.activeConversationId = action.payload;
      })
      .addCase(saveActiveConversation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save active conversation';
      });
  },
});

export const {
  setLoading,
  addMessage,
  updateLastMessage,
  setError,
  createNewConversation,
  setActiveConversation,
  deleteConversation,
  clearCurrentConversation,
  renameConversation
} = chatSlice.actions;

export default chatSlice.reducer;

// Utility function to create a new message
export const createMessage = (content: string, role: 'user' | 'assistant' | 'system'): Message => ({
  id: crypto.randomUUID(),
  content,
  role,
  timestamp: Date.now(),
});

// Thunk action creators for operations that need to save to storage
export const addMessageAndSave = createAsyncThunk(
  'chat/addMessageAndSave',
  async (message: Message, { dispatch, getState }) => {
    dispatch(addMessage(message));
    await dispatch(saveConversations((getState() as any).chat.conversations));
  }
);

export const createNewConversationAndSave = createAsyncThunk(
  'chat/createNewConversationAndSave',
  async (_, { dispatch, getState }) => {
    dispatch(createNewConversation());
    const state = getState() as any;
    await dispatch(saveConversations(state.chat.conversations));
    await dispatch(saveActiveConversation(state.chat.activeConversationId));
  }
);

export const deleteConversationAndSave = createAsyncThunk(
  'chat/deleteConversationAndSave',
  async (conversationId: string, { dispatch, getState }) => {
    dispatch(deleteConversation(conversationId));
    const state = getState() as any;
    await dispatch(saveConversations(state.chat.conversations));
    await dispatch(saveActiveConversation(state.chat.activeConversationId));
  }
);

export const clearCurrentConversationAndSave = createAsyncThunk(
  'chat/clearCurrentConversationAndSave',
  async (_, { dispatch, getState }) => {
    dispatch(clearCurrentConversation());
    await dispatch(saveConversations((getState() as any).chat.conversations));
  }
);

export const renameConversationAndSave = createAsyncThunk(
  'chat/renameConversationAndSave',
  async ({ id, title }: { id: string; title: string }, { dispatch, getState }) => {
    dispatch(renameConversation({ id, title }));
    await dispatch(saveConversations((getState() as any).chat.conversations));
  }
);