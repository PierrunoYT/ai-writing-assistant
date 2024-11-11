import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';

// Local storage keys
const USER_STORAGE_KEY = 'writing_assistant_user';

// Local storage utilities
const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

const loadUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      saveUserToStorage(action.payload);
    },
    setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state: AuthState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAuth: (state: AuthState) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      saveUserToStorage(null);
    },
  },
});

export const { setUser, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;

// Auth utilities for local authentication
export const authenticateUser = (email: string, password: string): User | null => {
  // In a real app, you'd hash the password. For demo purposes, we'll store in plain text
  const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
  const user = storedUsers[email];
  
  if (user && user.password === password) {
    const userData: User = {
      uid: user.uid,
      email: email,
      displayName: email.split('@')[0], // Use email username as display name
    };
    return userData;
  }
  return null;
};

export const createUser = (email: string, password: string): User => {
  const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
  
  if (storedUsers[email]) {
    throw new Error('User already exists');
  }
  
  const userData: User = {
    uid: crypto.randomUUID(), // Generate a unique ID
    email: email,
    displayName: email.split('@')[0],
  };
  
  storedUsers[email] = {
    uid: userData.uid,
    password: password, // In a real app, this should be hashed
  };
  
  localStorage.setItem('users', JSON.stringify(storedUsers));
  return userData;
};
