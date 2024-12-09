import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  showToolbar: boolean;
  isDrawerOpen: boolean;
}

const initialState: SettingsState = {
  showToolbar: true,
  isDrawerOpen: true,
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
  },
});

export const { toggleToolbar, setToolbarVisibility, toggleDrawer, setDrawerVisibility } = settingsSlice.actions;
export default settingsSlice.reducer;
