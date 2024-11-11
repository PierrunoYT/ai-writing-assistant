import { useState, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { Comment } from '../types';

interface DocumentEditorProps {
  content: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onDeleteComment: (id: string) => void;
  onReady: () => void;
  onChange: (content: string) => void;
}

const DocumentEditor = ({
  content,
  comments,
  onAddComment,
  onDeleteComment,
  onReady,
  onChange
}: DocumentEditorProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleTextSelect = () => {
    if (textFieldRef.current) {
      const start = textFieldRef.current.selectionStart ?? 0;
      const end = textFieldRef.current.selectionEnd ?? 0;
      
      if (start !== end) {
        const selected = content.substring(start, end);
        setSelectedText(selected);
      } else {
        setSelectedText('');
      }
    }
  };

  const handleAddComment = () => {
    if (textFieldRef.current && selectedText && commentInput) {
      const start = textFieldRef.current.selectionStart ?? 0;
      const end = textFieldRef.current.selectionEnd ?? 0;
      
      if (start !== end) {
        onAddComment({
          content: commentInput,
          position: { start, end }
        });

        setSelectedText('');
        setCommentInput('');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <Paper elevation={3} sx={{ flex: 2, p: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={20}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          inputRef={textFieldRef}
          sx={{ mb: 2 }}
        />
        {selectedText && (
          <Box sx={{ mt: 2 }}>
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
            >
              Add Comment
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Comments</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Return to Chat
            </Button>
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
        </Box>
        
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
                  onClick={() => onDeleteComment(comment.id)}
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
            <Typography sx={{ mb: 1 }} color="text.secondary">
              Selected text: "{content.substring(comment.position.start, comment.position.end)}"
            </Typography>
            <Typography>{comment.content}</Typography>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default DocumentEditor;
