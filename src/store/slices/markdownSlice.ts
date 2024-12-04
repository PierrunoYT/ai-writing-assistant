import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarkdownState {
  content: string;
}

const initialState: MarkdownState = {
  content: '',
};

const markdownSlice = createSlice({
  name: 'markdown',
  initialState,
  reducers: {
    setMarkdownContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
    },
  },
});

export const { setMarkdownContent } = markdownSlice.actions;
export default markdownSlice.reducer;
