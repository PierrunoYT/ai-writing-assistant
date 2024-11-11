import { Box, Paper, Typography } from '@mui/material';
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
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
          <Typography variant="caption" color={message.role === 'user' ? 'inherit' : 'text.secondary'}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default MessageList;
