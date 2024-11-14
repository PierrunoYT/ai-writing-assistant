import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, ChatState, Conversation } from '../../types';

// Local storage key for conversations
const CONVERSATIONS_STORAGE_KEY = 'writing_assistant_conversations';
const ACTIVE_CONVERSATION_KEY = 'writing_assistant_active_conversation';

// Local storage utilities
const saveConversationsToStorage = (conversations: Conversation[]) => {
  localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
};

const saveActiveConversationToStorage = (conversationId: string | null) => {
  if (conversationId) {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
  } else {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
  }
};

const loadConversationsFromStorage = (): Conversation[] => {
  const storedConversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
  return storedConversations ? JSON.parse(storedConversations) : [];
};

const loadActiveConversationFromStorage = (): string | null => {
  return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
};

// Create initial conversation if none exists
const createInitialConversation = (): Conversation => ({
  id: crypto.randomUUID(),
  title: 'New Conversation',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const initialConversations = loadConversationsFromStorage();
const initialState: ChatState = {
  conversations: initialConversations.length > 0 ? initialConversations : [createInitialConversation()],
  activeConversationId: loadActiveConversationFromStorage() || (initialConversations[0]?.id || createInitialConversation().id),
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
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        conversation.messages.push(action.payload);
        conversation.updatedAt = Date.now();
        // Update conversation title based on first user message if untitled
        if (conversation.title === 'New Conversation' && action.payload.role === 'user') {
          conversation.title = action.payload.content.slice(0, 30) + (action.payload.content.length > 30 ? '...' : '');
        }
        saveConversationsToStorage(state.conversations);
      }
    },
    updateLastMessage: (state: ChatState, action: PayloadAction<Message>) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation && conversation.messages.length > 0) {
        conversation.messages[conversation.messages.length - 1] = action.payload;
        conversation.updatedAt = Date.now();
        saveConversationsToStorage(state.conversations);
      }
    },
    setError: (state: ChatState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    createNewConversation: (state: ChatState) => {
      const newConversation = createInitialConversation();
      state.conversations.unshift(newConversation);
      state.activeConversationId = newConversation.id;
      saveConversationsToStorage(state.conversations);
      saveActiveConversationToStorage(newConversation.id);
    },
    setActiveConversation: (state: ChatState, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      saveActiveConversationToStorage(action.payload);
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
        saveConversationsToStorage(state.conversations);
        saveActiveConversationToStorage(state.activeConversationId);
      }
    },
    clearCurrentConversation: (state: ChatState) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        conversation.messages = [];
        conversation.title = 'New Conversation';
        conversation.updatedAt = Date.now();
        saveConversationsToStorage(state.conversations);
      }
    },
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
  clearCurrentConversation
} = chatSlice.actions;

export default chatSlice.reducer;

// Utility function to create a new message
export const createMessage = (content: string, role: 'user' | 'assistant' | 'system'): Message => ({
  id: crypto.randomUUID(),
  content,
  role,
  timestamp: Date.now(),
});
