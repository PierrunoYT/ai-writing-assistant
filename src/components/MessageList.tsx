import React from 'react';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Message } from '../types';

interface MessageRowProps {
  message: Message;
}

const MessageRow = ({ message }: MessageRowProps) => {
  return (
    <Box sx={{ 
      py: 1.5,
      px: 2
    }}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          maxWidth: '95%',
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
          },
          ml: message.role === 'user' ? 'auto' : '0',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              pr: message.role === 'assistant' ? 4 : 0,
              wordBreak: 'break-word',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
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
                aria-label="Copy message content"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography
          variant="caption"
          color={message.role === 'user' ? 'inherit' : 'text.secondary'}
          sx={{ mt: 1, display: 'block', opacity: 0.8 }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  );
};

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box 
      sx={{ 
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        pb: 2 // Add padding at bottom to prevent last message from being cut off
      }}
    >
      <Box sx={{ flex: 1 }}>
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
};

export default MessageList;
