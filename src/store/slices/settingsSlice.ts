import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  showToolbar: boolean;
}

const initialState: SettingsState = {
  showToolbar: true,
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
  },
});

export const { toggleToolbar, setToolbarVisibility } = settingsSlice.actions;
export default settingsSlice.reducer;
