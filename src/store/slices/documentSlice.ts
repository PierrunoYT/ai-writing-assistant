import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comment } from '../../types';

interface Document {
  id: string;
  title: string;
  content: string;
  comments: Comment[];
  lastModified: number;
}

interface DocumentState {
  documents: Document[];
  currentDocumentId: string | null;
  isEditorDisabled: boolean;
}

const initialState: DocumentState = {
  documents: [],
  currentDocumentId: null,
  isEditorDisabled: false,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    resetDocument: (state, action: PayloadAction<string>) => {
      const document = state.documents.find(doc => doc.id === action.payload);
      if (document) {
        document.content = '';
        document.comments = [];
        document.lastModified = Date.now();
      }
    },
    toggleEditorDisabled: (state) => {
      state.isEditorDisabled = !state.isEditorDisabled;
    },
    createDocument: (state, action: PayloadAction<{ title: string }>) => {
      const newDocument: Document = {
        id: Math.random().toString(36).substr(2, 9),
        title: action.payload.title,
        content: '',
        comments: [],
        lastModified: Date.now(),
      };
      state.documents.push(newDocument);
      state.currentDocumentId = newDocument.id;
    },
    setCurrentDocument: (state, action: PayloadAction<string>) => {
      state.currentDocumentId = action.payload;
    },
    updateDocumentContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const document = state.documents.find(doc => doc.id === action.payload.id);
      if (document) {
        document.content = action.payload.content;
        document.lastModified = Date.now();
      }
    },
    addComment: (state, action: PayloadAction<{ documentId: string; comment: Omit<Comment, 'id' | 'timestamp'> }>) => {
      const document = state.documents.find(doc => doc.id === action.payload.documentId);
      if (document) {
        document.comments.push({
          ...action.payload.comment,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        });
        document.lastModified = Date.now();
      }
    },
    deleteComment: (state, action: PayloadAction<{ documentId: string; commentId: string }>) => {
      const document = state.documents.find(doc => doc.id === action.payload.documentId);
      if (document) {
        document.comments = document.comments.filter(comment => comment.id !== action.payload.commentId);
        document.lastModified = Date.now();
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
      if (state.currentDocumentId === action.payload) {
        state.currentDocumentId = state.documents[0]?.id || null;
      }
    },
    updateDocumentTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const document = state.documents.find(doc => doc.id === action.payload.id);
      if (document) {
        document.title = action.payload.title;
        document.lastModified = Date.now();
      }
    },
    startRewrite: (state) => {
      state.isEditorDisabled = true;
    },
    finishRewrite: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const document = state.documents.find(doc => doc.id === action.payload.id);
      if (document) {
        document.content = action.payload.content;
        document.lastModified = Date.now();
        document.comments = []; // Clear comments after rewrite
      }
      state.isEditorDisabled = false;
    }
  },
});

export const {
  createDocument,
  setCurrentDocument,
  updateDocumentContent,
  addComment,
  deleteComment,
  deleteDocument,
  updateDocumentTitle,
  resetDocument,
  toggleEditorDisabled,
  startRewrite,
  finishRewrite
} = documentSlice.actions;

export default documentSlice.reducer;