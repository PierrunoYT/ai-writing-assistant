import { useState, useCallback } from 'react';
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
  Grid,
  Container,
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
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', bgcolor: theme.palette.background.default }}>
      <Grid container spacing={0} sx={{ height: '100%' }}>
        {/* Header */}
        <Grid item xs={12} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} sx={{ height: 'calc(100% - 72px)', overflow: 'hidden' }}>
          <Grid container spacing={2} sx={{ height: '100%', p: 2 }}>
            {/* Document Area */}
            <Grid item xs={8} sx={{ height: '100%' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  height: '100%',
                  bgcolor: theme.palette.background.paper,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                  onInput={(e) => setContent(e.currentTarget.textContent || '')}
                  onMouseUp={handleTextSelect}
                  style={{
                    height: '100%',
                    padding: '24px',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    overflowY: 'auto',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              </Paper>
            </Grid>

            {/* Comments Area */}
            <Grid item xs={4} sx={{ height: '100%' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  height: '100%',
                  bgcolor: theme.palette.background.paper,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Comments Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                </Box>

                {/* Add Comment Section */}
                {selectedText && (
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
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
                      placeholder="Type your comment here"
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
                )}

                {/* Comments List */}
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  p: 2
                }}>
                  {sortedComments.map((comment) => (
                    <Fade key={comment.id} in={true}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2,
                          mb: 2,
                          bgcolor: theme.palette.action.hover,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            borderColor: theme.palette.primary.main
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

                {/* Process Button */}
                {comments.length > 0 && (
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: 1,
                        py: 1.5
                      }}
                    >
                      {isProcessing ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Process Document'
                      )}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

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
    </Container>
  );
};

export default DocumentMode;
