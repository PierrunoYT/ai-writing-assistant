import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Mode = 'chat' | 'document' | 'markdown';

interface ModeState {
  currentMode: Mode;
}

const initialState: ModeState = {
  currentMode: 'chat',
};

const modeSlice = createSlice({
  name: 'mode',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<Mode>) => {
      state.currentMode = action.payload;
    },
  },
});

export const { setMode } = modeSlice.actions;
export default modeSlice.reducer;