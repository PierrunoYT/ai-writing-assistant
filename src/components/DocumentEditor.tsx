import { useState, useCallback, KeyboardEvent, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
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
  id: string;
  text: string;
  start: number;
  end: number;
  commentInput: string;
}

interface Segment {
  text: string;
  start: number;
  end: number;
  isEditing: boolean;
}

const DocumentEditor = ({
  content,
  comments,
  onAddComment,
  onDeleteComment,
  onReady,
  onChange
}: DocumentEditorProps) => {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Split content into segments based on comments
  useEffect(() => {
    const positions = comments
      .map(comment => [comment.position.start, comment.position.end])
      .flat()
      .sort((a, b) => a - b);

    const uniquePositions = Array.from(new Set([0, ...positions, content.length]));
    const newSegments: Segment[] = [];

    for (let i = 0; i < uniquePositions.length - 1; i++) {
      const start = uniquePositions[i];
      const end = uniquePositions[i + 1];
      newSegments.push({
        text: content.substring(start, end),
        start,
        end,
        isEditing: false
      });
    }

    setSegments(newSegments);
  }, [content, comments]);

  const handleSegmentEdit = (index: number, newText: string) => {
    const newSegments = [...segments];
    const oldLength = segments[index].text.length;
    const lengthDiff = newText.length - oldLength;
    
    // Update the current segment
    newSegments[index] = {
      ...segments[index],
      text: newText
    };

    // Update subsequent segments' positions
    for (let i = index + 1; i < segments.length; i++) {
      newSegments[i] = {
        ...segments[i],
        start: segments[i].start + lengthDiff,
        end: segments[i].end + lengthDiff
      };
    }

    // Update comments' positions and notify parent
    const updatedContent = newSegments.map(seg => seg.text).join('');
    onChange(updatedContent);

    setSegments(newSegments);
  };

  const toggleSegmentEdit = (index: number) => {
    setSegments(prev => prev.map((seg, i) => ({
      ...seg,
      isEditing: i === index ? !seg.isEditing : false
    })));
  };

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Find the segment containing the selection
    let start = -1;
    let end = -1;

    segments.forEach(segment => {
      const segmentContent = segment.text;
      const selectionIndex = segmentContent.indexOf(selectedText);
      
      if (selectionIndex !== -1) {
        start = segment.start + selectionIndex;
        end = start + selectedText.length;
      }
    });

    if (start !== -1 && end !== -1) {
      const newSelection: Selection = {
        id: Math.random().toString(36).substr(2, 9),
        text: selectedText,
        start,
        end,
        commentInput: ''
      };
      setSelections(prev => [...prev, newSelection]);
    }
  }, [segments]);

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

    onAddComment({
      content: selection.commentInput.trim(),
      position: {
        start: selection.start,
        end: selection.end
      }
    });

    setSelections(prev => prev.filter(s => s.id !== selectionId));
    setSnackbar({
      open: true,
      message: 'Comment added successfully',
      severity: 'success'
    });
  }, [selections, onAddComment]);

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

  const removeSelection = (selectionId: string) => {
    setSelections(prev => prev.filter(s => s.id !== selectionId));
  };

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
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            p: 2
          }}
          onMouseUp={handleTextSelect}
        >
          {segments.map((segment, index) => (
            <Box 
              key={index}
              sx={{ 
                position: 'relative',
                mb: 1,
                '&:hover .edit-button': {
                  opacity: 1
                }
              }}
            >
              {segment.isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  value={segment.text}
                  onChange={(e) => handleSegmentEdit(index, e.target.value)}
                  autoFocus
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography 
                  component="div"
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {segment.text}
                </Typography>
              )}
              <IconButton
                className="edit-button"
                size="small"
                onClick={() => toggleSegmentEdit(index)}
                sx={{
                  position: 'absolute',
                  right: -36,
                  top: 0,
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
              >
                {segment.isEditing ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </Box>
          ))}
        </Box>
        
        {selections.length > 0 && (
          <Box sx={{ p: 2, flexShrink: 0 }}>
            <Stack spacing={2}>
              {selections.map((selection) => (
                <Box key={selection.id} sx={{ position: 'relative' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Selected text: "{selection.text}"
                  </Typography>
                  <TextField
                    fullWidth
                    label="Add comment"
                    value={selection.commentInput}
                    onChange={(e) => handleCommentInputChange(selection.id, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, selection.id)}
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Type your comment here... (Ctrl/Cmd + Enter to submit)"
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => handleAddComment(selection.id)}
                      disabled={!selection.commentInput.trim()}
                      fullWidth
                      endIcon={<KeyboardReturnIcon />}
                    >
                      Add Comment
                    </Button>
                    <IconButton
                      onClick={() => removeSelection(selection.id)}
                      color="error"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
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
