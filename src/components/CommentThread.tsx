import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Chip,
  Stack,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ReplyIcon from '@mui/icons-material/Reply';
import { Comment, CommentReply } from '../types';

interface CommentThreadProps {
  comment: Comment;
  selectedText: string;
  onDelete: () => void;
  onStatusChange: (status: 'open' | 'resolved') => void;
  onReply: (content: string) => void;
}

const CommentThread = ({
  comment,
  selectedText,
  onDelete,
  onStatusChange,
  onReply
}: CommentThreadProps) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
      setIsReplyOpen(false);
    }
  };

  return (
    <Paper
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
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {new Date(comment.timestamp).toLocaleString()}
          </Typography>
          <Chip
            size="small"
            label={comment.status}
            color={comment.status === 'resolved' ? 'success' : 'warning'}
            onClick={() => onStatusChange(comment.status === 'resolved' ? 'open' : 'resolved')}
            icon={comment.status === 'resolved' ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
          />
        </Stack>
        <Tooltip title="Delete comment">
          <IconButton
            size="small"
            onClick={onDelete}
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
          backgroundColor: comment.highlightColor || 'rgba(255, 212, 0, 0.4)',
          p: 1,
          borderRadius: 1
        }}
        color="text.secondary"
        variant="body2"
      >
        Selected text: "{selectedText}"
      </Typography>

      <Typography sx={{ mb: 2 }}>{comment.content}</Typography>

      {comment.replies.length > 0 && (
        <Box sx={{ ml: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Replies
          </Typography>
          <Stack spacing={1}>
            {comment.replies.map((reply: CommentReply) => (
              <Box
                key={reply.id}
                sx={{
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  {new Date(reply.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2">{reply.content}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          size="small"
          startIcon={<ReplyIcon />}
          onClick={() => setIsReplyOpen(!isReplyOpen)}
        >
          Reply
        </Button>

        <Collapse in={isReplyOpen}>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              sx={{ mb: 1 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
              >
                Submit Reply
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setIsReplyOpen(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default CommentThread;