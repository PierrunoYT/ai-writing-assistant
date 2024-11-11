import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import { Comment } from '../types';

interface DocumentModeProps {
  onSwitchMode: () => void;
  onSubmitDocument: (content: string, comments: Comment[]) => void;
}

const DocumentMode = ({ onSwitchMode, onSubmitDocument }: DocumentModeProps) => {
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [commentInput, setCommentInput] = useState('');

  const handleTextSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    
    if (start !== null && end !== null && start !== end) {
      setSelectedText(content.substring(start, end));
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Document Editor</Typography>
        <Button
          variant="outlined"
          startIcon={<ChatIcon />}
          onClick={onSwitchMode}
        >
          Return to Chat
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 250px)' }}>
        <Paper elevation={3} sx={{ flex: 2, p: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={handleTextSelect}
            placeholder="Enter your text here..."
            sx={{ height: '100%' }}
          />
        </Paper>

        <Paper elevation={3} sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
          
          {selectedText && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Add comment"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddComment}
                disabled={!commentInput}
                fullWidth
              >
                Add Comment
              </Button>
            </Box>
          )}

          {comments.map((comment) => (
            <Paper 
              key={comment.id} 
              elevation={1} 
              sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </Typography>
                <Tooltip title="Delete comment">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography sx={{ mb: 1 }} color="text.secondary">
                Selected text: "{content.substring(comment.position.start, comment.position.end)}"
              </Typography>
              <Typography>{comment.content}</Typography>
            </Paper>
          ))}

          {comments.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ mt: 2 }}
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
