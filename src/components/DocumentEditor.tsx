import { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Comment } from '../types';

interface DocumentEditorProps {
  content: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onDeleteComment: (id: string) => void;
  onReady: () => void;
  onChange: (content: string) => void;
}

interface Selection {
  text: string;
  start: number;
  end: number;
}

const DocumentEditor = ({
  content,
  comments,
  onAddComment,
  onDeleteComment,
  onReady,
  onChange
}: DocumentEditorProps) => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleTextSelect = useCallback(() => {
    if (textFieldRef.current) {
      const start = textFieldRef.current.selectionStart ?? 0;
      const end = textFieldRef.current.selectionEnd ?? 0;
      
      if (start !== end) {
        const selected = textFieldRef.current.value.substring(start, end);
        setSelection({ text: selected, start, end });
      } else {
        setSelection(null);
      }
    }
  }, []);

  const handleAddComment = useCallback(() => {
    if (!selection || !commentInput.trim()) {
      setSnackbar({
        open: true,
        message: 'Please select text and enter a comment',
        severity: 'error'
      });
      return;
    }

    onAddComment({
      content: commentInput.trim(),
      position: {
        start: selection.start,
        end: selection.end
      }
    });

    setSelection(null);
    setCommentInput('');
    setSnackbar({
      open: true,
      message: 'Comment added successfully',
      severity: 'success'
    });

    // Return focus to the main text field
    textFieldRef.current?.focus();
  }, [selection, commentInput, onAddComment]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Ctrl/Cmd + Enter to add comment
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && selection && commentInput) {
      e.preventDefault();
      handleAddComment();
    }
  }, [selection, commentInput, handleAddComment]);

  // Auto-focus comment input when text is selected
  useEffect(() => {
    if (selection) {
      commentInputRef.current?.focus();
    }
  }, [selection]);

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      p: 2,
      boxSizing: 'border-box'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 2
        }}>
          <TextField
            fullWidth
            multiline
            minRows={20}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleTextSelect}
            onMouseUp={handleTextSelect}
            onKeyUp={handleTextSelect}
            inputRef={textFieldRef}
            placeholder="Enter or paste your text here..."
            sx={{ 
              '& .MuiInputBase-root': {
                height: '100%'
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
                lineHeight: '1.5',
                fontSize: '1rem'
              }
            }}
          />
        </Box>
        
        {selection && (
          <Box sx={{ p: 2, flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Selected text: "{selection.text}"
            </Typography>
            <TextField
              fullWidth
              label="Add comment"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={handleKeyPress}
              inputRef={commentInputRef}
              sx={{ mb: 1 }}
              size="small"
              multiline
              rows={2}
              placeholder="Type your comment here... (Ctrl/Cmd + Enter to submit)"
            />
            <Button 
              variant="contained" 
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
              fullWidth
              endIcon={<KeyboardReturnIcon />}
            >
              Add Comment
            </Button>
          </Box>
        )}
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6">
              Comments ({comments.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={onReady}
              disabled={comments.length === 0}
            >
              Ready to Rewrite
            </Button>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => window.location.reload()}
            sx={{ mb: 1 }}
          >
            Return to Chat
          </Button>
        </Box>
        
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          px: 2,
          pb: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.divider,
            borderRadius: '4px',
          }
        }}>
          {comments.length === 0 ? (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ textAlign: 'center', mt: 4 }}
            >
              Select text and add comments to begin
            </Typography>
          ) : (
            comments.map((comment) => (
              <Paper 
                key={comment.id} 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'background.default',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.timestamp).toLocaleString()}
                  </Typography>
                  <Tooltip title="Delete comment">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        onDeleteComment(comment.id);
                        setSnackbar({
                          open: true,
                          message: 'Comment deleted',
                          severity: 'info'
                        });
                      }}
                      sx={{ 
                        '&:hover': {
                          color: 'error.main'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography 
                  sx={{ 
                    mb: 1,
                    backgroundColor: (theme) => theme.palette.action.hover,
                    p: 1,
                    borderRadius: 1
                  }} 
                  color="text.secondary"
                  variant="body2"
                >
                  Selected text: "{content.substring(comment.position.start, comment.position.end)}"
                </Typography>
                <Typography>{comment.content}</Typography>
              </Paper>
            ))
          )}
        </Box>
      </Paper>

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
    </Box>
  );
};

export default DocumentEditor;
