import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  showToolbar: boolean;
  isDrawerOpen: boolean;
  globalSystemPromptId: string | null;
  globalSystemPrompt: string | null;
}

const initialState: SettingsState = {
  showToolbar: true,
  isDrawerOpen: true,
  globalSystemPromptId: null,
  globalSystemPrompt: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleToolbar: (state) => {
      state.showToolbar = !state.showToolbar;
    },
    setToolbarVisibility: (state, action: PayloadAction<boolean>) => {
      state.showToolbar = action.payload;
    },
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setDrawerVisibility: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    setGlobalSystemPrompt: (state, action: PayloadAction<string | null>) => {
      state.globalSystemPromptId = action.payload;
    },
    setGlobalSystemPromptContent: (state, action: PayloadAction<string | null>) => {
      state.globalSystemPrompt = action.payload;
    },
  },
});

export const {
  toggleToolbar,
  setToolbarVisibility,
  toggleDrawer,
  setDrawerVisibility,
  setGlobalSystemPrompt,
  setGlobalSystemPromptContent
} = settingsSlice.actions;
export default settingsSlice.reducer;
