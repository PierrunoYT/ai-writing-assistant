import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import CommentIcon from '@mui/icons-material/Comment';
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

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const handleAddComment = () => {
    if (selectedText && commentInput) {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        content: commentInput,
        position: {
          start: content.indexOf(selectedText),
          end: content.indexOf(selectedText) + selectedText.length
        },
        timestamp: Date.now()
      };
      setComments([...comments, newComment]);
      setCommentInput('');
      setSelectedText('');
    }
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  const handleSubmit = () => {
    if (content && comments.length > 0) {
      onSubmitDocument(content, comments);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      height: '100vh',
      p: 3,
      bgcolor: theme.palette.background.default
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Document Editor
        </Typography>
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

      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        height: 'calc(100vh - 120px)',
        flex: 1
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 2,
            p: 3,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            '&:hover': {
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <TextField
            fullWidth
            multiline
            minRows={25}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={handleTextSelect}
            placeholder="Enter your text here..."
            variant="outlined"
            sx={{
              height: '100%',
              '& .MuiOutlinedInput-root': {
                height: '100%',
                '& textarea': {
                  height: '100% !important',
                  overflowY: 'auto !important',
                  lineHeight: '1.6',
                  fontSize: '1rem',
                  padding: 2,
                  '&::selection': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText
                  }
                }
              }
            }}
          />
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1,
            p: 3,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.background.paper,
            '&:hover': {
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mb: 3
          }}>
            <CommentIcon color="primary" />
            <Typography variant="h6" color="primary" fontWeight="medium">
              Comments
            </Typography>
          </Box>
          
          {selectedText && (
            <Box sx={{ 
              mb: 3,
              p: 2,
              bgcolor: theme.palette.action.hover,
              borderRadius: 1
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

          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '4px',
            }
          }}>
            {comments.map((comment) => (
              <Paper 
                key={comment.id} 
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
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1 
                }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.timestamp).toLocaleTimeString()}
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
            ))}
          </Box>

          {comments.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ 
                mt: 2,
                textTransform: 'none',
                borderRadius: 1,
                py: 1.5
              }}
            >
              Process Document
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default DocumentMode;
