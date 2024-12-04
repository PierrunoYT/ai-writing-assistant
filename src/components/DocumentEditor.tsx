import { useState, useCallback, KeyboardEvent, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Button, 
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { sendChatRequest } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { resetDocument, startRewrite, finishRewrite } from '../store/slices/documentSlice';
import { RootState } from '../store';
import { Message } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CloseIcon from '@mui/icons-material/Close';
import { Comment } from '../types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize, TextColor, CommentMarker } from './editor/extensions';
import EditorToolbar from './EditorToolbar';
import CommentThread from './CommentThread';

interface DocumentEditorProps {
  content: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id'>) => void;
  onDeleteComment: (id: string) => void;
  onUpdateComment?: (comment: Comment) => void;
  onReady: () => void;
  onChange: (content: string) => void;
}

interface Selection {
  id: string;
  text: string;
  start: number;
  end: number;
  commentInput: string;
}

const DocumentEditor = ({
  content,
  comments,
  onAddComment,
  onDeleteComment,
  onUpdateComment,
  onReady,
  onChange
}: DocumentEditorProps) => {
  const dispatch = useDispatch();
  const currentDocumentId = useSelector((state: RootState) => state.document.currentDocumentId);
  const isEditorDisabled = useSelector((state: RootState) => state.document.isEditorDisabled);
  const currentMode = useSelector((state: RootState) => state.mode.currentMode);
  const showToolbar = useSelector((state: RootState) => state.settings.showToolbar);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const [selectedText, setSelectedText] = useState<{text: string, from: number, to: number} | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'center', 'right'],
      }),
      TextStyle,
      FontFamily,
      Color,
      FontSize,
      TextColor,
      CommentMarker,
    ],
    content: content,
    editable: currentMode === 'document' && !isEditorDisabled,
    autofocus: true,
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      
      if (isEditorDisabled && text) {
        setSelectedText({ text, from, to });
        setShowCommentInput(true);
      } else {
        setSelectedText(null);
        setShowCommentInput(false);
      }
    },
    onUpdate: ({ editor }) => {
      // Only allow content updates when not disabled
      if (!isEditorDisabled) {
        onChange(editor.getHTML());
      }
    },
    onCreate: ({ editor }) => {
      console.log('Editor created');
      onReady();
      editor.commands.focus();
    }
  });

  const handleReset = useCallback(() => {
    if (currentDocumentId) {
      dispatch(resetDocument(currentDocumentId));
      if (editor) {
        editor.commands.setContent('');
      }
      setSnackbar({
        open: true,
        message: 'Document has been reset',
        severity: 'info'
      });
      setResetDialogOpen(false);
    }
  }, [currentDocumentId, dispatch, editor]);

  const handleTextSelect = useCallback((event: MouseEvent) => {
    if (!editor) return;
    
    // Check if the click target is within the editor content area
    const editorContent = document.querySelector('.ProseMirror');
    const target = event.target as HTMLElement;
    
    // Return if click is not within editor content or is within comment section
    if (!editorContent?.contains(target) || target.closest('[role="textbox"]')) {
      return;
    }
    
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const selectedText = editor.state.doc.textBetween(from, to);
    if (!selectedText.trim()) return;

    const newSelection: Selection = {
      id: Math.random().toString(36).substr(2, 9),
      text: selectedText,
      start: from,
      end: to,
      commentInput: ''
    };
    setSelections(prev => [...prev, newSelection]);
  }, [editor]);

  const handleAddComment = useCallback((selectionId: string) => {
    const selection = selections.find(s => s.id === selectionId);
    if (!selection || !selection.commentInput.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a comment',
        severity: 'error'
      });
      return;
    }

    const commentId = Math.random().toString(36).substr(2, 9);
    const highlightColor = 'rgba(255, 212, 0, 0.4)';

    if (editor) {
      editor.commands.toggleComment(commentId, highlightColor);
    }

    onAddComment({
      content: selection.commentInput.trim(),
      position: {
        start: selection.start,
        end: selection.end
      },
      status: 'open',
      replies: [],
      highlightColor,
      timestamp: Date.now()
    });

    setSelections(prev => prev.filter(s => s.id !== selectionId));
    setSnackbar({
      open: true,
      message: 'Comment added successfully',
      severity: 'success'
    });
  }, [selections, onAddComment, editor]);

  const handleKeyPress = useCallback((e: KeyboardEvent, selectionId: string) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddComment(selectionId);
    }
  }, [handleAddComment]);

  const handleCommentInputChange = (selectionId: string, value: string) => {
    setSelections(prev => prev.map(s => 
      s.id === selectionId ? { ...s, commentInput: value } : s
    ));
  };

  const handleRewrite = useCallback(async () => {
    if (!currentDocumentId || !editor || comments.length === 0) return;

    try {
      dispatch(startRewrite());
      setSnackbar({
        open: true,
        message: 'Starting rewrite based on comments...',
        severity: 'info'
      });

      const originalContent = editor.getHTML();
      const commentSummary = comments.map(c => 
        `- ${editor.state.doc.textBetween(c.position.start, c.position.end)}: ${c.content}`
      ).join('\n');

      // Prepare the message for the AI
      const messages: Message[] = [
        {
          id: 'system-' + Date.now(),
          role: 'system',
          content: `You are a professional editor. Your task is to rewrite the given text based on the provided comments while:
1. Maintaining the original meaning and improving the quality of writing
2. Addressing each comment's feedback thoughtfully
3. Ensuring the text flows naturally and maintains consistency
4. Preserving any special formatting or structure present in the original text`,
          timestamp: Date.now()
        },
        {
          id: 'user-' + Date.now(),
          role: 'user',
          content: `Please rewrite the following text based on these comments. Preserve all HTML formatting in your response:\n\nOriginal text:\n${editor.getHTML()}\n\nComments:\n${commentSummary}`,
          timestamp: Date.now()
        }
      ];

      let rewrittenContent = '';
      await sendChatRequest(messages, (content: string) => {
        rewrittenContent = content;
      });

      // Only update if we got a response
      if (rewrittenContent && editor) {
        // Update the editor content
        editor.commands.setContent(rewrittenContent);
        
        // Then update the Redux store
        dispatch(finishRewrite({ 
          id: currentDocumentId, 
          content: rewrittenContent 
        }));

        setSnackbar({
          open: true,
          message: 'Document has been rewritten based on comments',
          severity: 'success'
        });
      } else {
        throw new Error('No content was generated');
      }
    } catch (error) {
      console.error('Error during rewrite:', error);
      dispatch(finishRewrite({ 
        id: currentDocumentId, 
        content: editor.getHTML() // Keep original content on error
      }));
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to rewrite document',
        severity: 'error'
      });
    }
  }, [currentDocumentId, editor, comments, dispatch]);

  useEffect(() => {
    if (editor) {
      console.log('Editor Mode:', currentMode);
      console.log('Editor Disabled:', isEditorDisabled);
      console.log('Editor Editable:', editor.isEditable);
      
      const shouldBeEditable = currentMode === 'document' && !isEditorDisabled;
      editor.setEditable(shouldBeEditable);
      
      console.log('Editor Editable after set:', editor.isEditable);
      
      // Focus the editor when switching to document mode and not disabled
      if (shouldBeEditable) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          editor.commands.focus();
        }, 0);
      }
    }
  }, [editor, currentMode, isEditorDisabled]);

  const removeSelection = (selectionId: string) => {
    setSelections(prev => prev.filter(s => s.id !== selectionId));
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showToolbar && <EditorToolbar editor={editor} />}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        gap: 2,
        height: showToolbar ? 'calc(100% - 50px)' : '100%',
        overflow: 'hidden'
      }}>
        {/* Editor Panel */}
        <Paper 
          sx={{ 
            flex: 2,
            p: 2, 
            overflowY: 'auto',
            position: 'relative'
          }}
        >
          <EditorContent editor={editor} />
          
          {showCommentInput && selectedText && (
            <Paper
              elevation={3}
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                p: 2,
                zIndex: 1000,
                minWidth: 300
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle2">Add comment to selected text:</Typography>
                <Typography variant="body2" color="text.secondary">
                  "{selectedText.text}"
                </Typography>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '8px',
                    marginBottom: '8px'
                  }}
                  placeholder="Type your comment here..."
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={() => {
                      setShowCommentInput(false);
                      setCommentInput('');
                      setSelectedText(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() => {
                      if (selectedText && commentInput.trim()) {
                        onAddComment({
                          content: commentInput,
                          position: {
                            start: selectedText.from,
                            end: selectedText.to
                          },
                          status: 'open',
                          replies: [],
                          timestamp: Date.now()
                        });
                        setShowCommentInput(false);
                        setCommentInput('');
                        setSelectedText(null);
                      }
                    }}
                  >
                    Add Comment
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Paper>

        {/* Comments Panel */}
        <Paper 
          sx={{ 
            flex: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2,
            mb: 2,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Typography variant="h6">
                Comments ({comments.length})
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => setResetDialogOpen(true)}
              >
                Reset
              </Button>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleRewrite}
              disabled={comments.length === 0}
              fullWidth
            >
              Rewrite Based on Comments
            </Button>
          </Box>

          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            '& > *:not(:last-child)': {
              mb: 2
            }
          }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No comments yet. Select text to add comments.
              </Typography>
            ) : (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  selectedText={editor ? 
                    editor.state.doc.textBetween(comment.position.start, comment.position.end) : 
                    'Text not available'}
                  onDelete={() => {
                    onDeleteComment(comment.id);
                    setSnackbar({
                      open: true,
                      message: 'Comment deleted',
                      severity: 'info'
                    });
                  }}
                  onStatusChange={(status: 'open' | 'resolved') => {
                    if (onUpdateComment) {
                      onUpdateComment({
                        ...comment,
                        status
                      });
                    }
                  }}
                  onReply={(content: string) => {
                    if (onUpdateComment) {
                      const reply = {
                        id: Math.random().toString(36).substr(2, 9),
                        content,
                        timestamp: Date.now()
                      };
                      onUpdateComment({
                        ...comment,
                        replies: [...(comment.replies || []), reply]
                      });
                    }
                  }}
                />
              ))
            )}
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>
          Reset Document?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all content and remove all comments. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReset} color="warning" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentEditor;