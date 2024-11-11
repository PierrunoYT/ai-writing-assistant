import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {messages.map((message) => (
        <Paper
          key={message.id}
          elevation={1}
          sx={{
            p: 2.5,
            maxWidth: '80%',
            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            bgcolor: message.role === 'user' ? 'primary.dark' : 'background.paper',
            color: message.role === 'user' ? 'white' : 'text.primary',
            borderRadius: '1.5rem',
            boxShadow: (theme) => 
              message.role === 'user' 
                ? `0 4px 6px -1px ${theme.palette.primary.dark}20`
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease-in-out',
              bgcolor: (theme) => message.role === 'user' 
                ? theme.palette.primary.main 
                : theme.palette.action.hover,
            },
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pr: message.role === 'assistant' ? 4 : 0 }}>
              {message.content}
            </Typography>
            {message.role === 'assistant' && message.content && (
              <Tooltip title="Copy response">
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Typography variant="caption" color={message.role === 'user' ? 'inherit' : 'text.secondary'}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default MessageList;
