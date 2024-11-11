import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Chip,
  Fade,
  Snackbar,
  Alert,
  AlertColor,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import CommentIcon from '@mui/icons-material/Comment';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SortIcon from '@mui/icons-material/Sort';
import { Comment } from '../types';

interface DocumentModeProps {
  onSwitchMode: () => void;
  onSubmitDocument: (content: string, comments: Comment[]) => void;
}

const DocumentMode = ({ onSwitchMode, onSubmitDocument }: DocumentModeProps) => {
  const theme = useTheme();
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'success' });
  const [sortOrder, setSortOrder] = useState<'time' | 'position'>('time');
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText('');
    }
  }, []);

  const handleAddComment = useCallback(() => {
    if (selectedText && commentInput) {
      const textIndex = content.indexOf(selectedText);
      if (textIndex === -1) {
        setSnackbar({
          open: true,
          message: 'Selected text no longer found in document',
          severity: 'error'
        });
        return;
      }

      const newComment: Comment = {
        id: crypto.randomUUID(),
        content: commentInput,
        position: {
          start: textIndex,
          end: textIndex + selectedText.length
        },
        timestamp: Date.now()
      };
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
      setSelectedText('');
      setSnackbar({
        open: true,
        message: 'Comment added successfully',
        severity: 'success'
      });
    }
  }, [selectedText, commentInput, content]);

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(comment => comment.id !== id));
    setSnackbar({
      open: true,
      message: 'Comment deleted',
      severity: 'info'
    });
  };

  const handleSubmit = async () => {
    if (content && comments.length > 0) {
      setIsProcessing(true);
      try {
        await onSubmitDocument(content, comments);
        setSnackbar({
          open: true,
          message: 'Document processed successfully',
          severity: 'success'
        });
      } catch {
        setSnackbar({
          open: true,
          message: 'Error processing document',
          severity: 'error'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === 'time') {
      return b.timestamp - a.timestamp;
    }
    return a.position.start - b.position.start;
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && selectedText && commentInput) {
        handleAddComment();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleAddComment, selectedText, commentInput]);

  const getHighlightedContent = () => {
    let result = content;
    const highlights = comments.map(comment => ({
      ...comment.position,
      id: comment.id
    }));
    
    highlights.sort((a, b) => b.start - a.start);
    
    highlights.forEach(({ start, end, id }) => {
      const isHovered = id === hoveredCommentId;
      const highlightColor = isHovered 
        ? theme.palette.primary.main 
        : theme.palette.primary.light;
      const textColor = isHovered
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary;
      
      result = 
        result.slice(0, start) +
        `<span style="background-color: ${highlightColor}; color: ${textColor}; padding: 0 2px; border-radius: 2px;">` +
        result.slice(start, end) +
        '</span>' +
        result.slice(end);
    });
    
    return result;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: 'calc(100vh - 32px)', // Adjusted to account for padding
      p: 2,
      bgcolor: theme.palette.background.default,
      overflow: 'hidden' // Prevent outer scrolling
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexShrink: 0 // Prevent header from shrinking
      }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Document Editor
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Keyboard shortcuts">
            <IconButton size="small">
              <KeyboardIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={onSwitchMode}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Return to Chat
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        flex: 1,
        minHeight: 0, // Important for proper flex behavior
        overflow: 'hidden' // Contain the scrolling
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            transition: 'box-shadow 0.2s',
            overflow: 'hidden', // Contain the scrolling
            '&:hover': {
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <div
            contentEditable
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
            onInput={(e) => setContent(e.currentTarget.textContent || '')}
            onMouseUp={handleTextSelect}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16.5px 14px',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              fontSize: '1rem',
              lineHeight: 1.6,
              outline: 'none',
              minHeight: '100%', // Ensure full height usage
              wordWrap: 'break-word', // Prevent horizontal overflow
              whiteSpace: 'pre-wrap' // Preserve whitespace and wrapping
            }}
          />
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            transition: 'box-shadow 0.2s',
            overflow: 'hidden', // Contain the scrolling
            '&:hover': {
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2,
            flexShrink: 0 // Prevent header from shrinking
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CommentIcon color="primary" />
              <Typography variant="h6" color="primary" fontWeight="medium">
                Comments
              </Typography>
              <Chip 
                label={comments.length} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <Tooltip title="Toggle sort order">
              <IconButton 
                size="small" 
                onClick={() => setSortOrder(prev => prev === 'time' ? 'position' : 'time')}
              >
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Fade in={Boolean(selectedText)}>
            <Box sx={{ 
              mb: 2,
              p: 2,
              bgcolor: theme.palette.action.hover,
              borderRadius: 1,
              flexShrink: 0 // Prevent comment input from shrinking
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Selected text: "{selectedText}"
              </Typography>
              <TextField
                fullWidth
                label="Add comment"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                sx={{ mb: 1 }}
                size="small"
                multiline
                rows={2}
                placeholder="Press Ctrl/Cmd + Enter to add comment"
              />
              <Button 
                variant="contained" 
                onClick={handleAddComment}
                disabled={!commentInput}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderRadius: 1
                }}
              >
                Add Comment
              </Button>
            </Box>
          </Fade>

          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '4px',
            }
          }}>
            {sortedComments.map((comment) => (
              <Fade key={comment.id} in={true}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2,
                    mb: 2,
                    bgcolor: theme.palette.action.hover,
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: theme.shadows[2]
                    }
                  }}
                  onMouseEnter={() => setHoveredCommentId(comment.id)}
                  onMouseLeave={() => setHoveredCommentId(null)}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1 
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.timestamp).toLocaleString()}
                    </Typography>
                    <Tooltip title="Delete comment">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteComment(comment.id)}
                        sx={{
                          color: theme.palette.error.main,
                          '&:hover': {
                            bgcolor: theme.palette.error.light
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
                      fontSize: '0.875rem',
                      color: theme.palette.text.secondary,
                      bgcolor: theme.palette.background.paper,
                      p: 1,
                      borderRadius: 1,
                      borderLeft: `3px solid ${theme.palette.primary.main}`
                    }}
                  >
                    "{content.substring(comment.position.start, comment.position.end)}"
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.9rem',
                    color: theme.palette.text.primary
                  }}>
                    {comment.content}
                  </Typography>
                </Paper>
              </Fade>
            ))}
          </Box>

          {comments.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={isProcessing}
              sx={{ 
                mt: 2,
                textTransform: 'none',
                borderRadius: 1,
                py: 1.5,
                flexShrink: 0 // Prevent button from shrinking
              }}
            >
              {isProcessing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Process Document'
              )}
            </Button>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentMode;
