import React from 'react';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Message } from '../types';
import { useDispatch } from 'react-redux';
import { setMarkdownContent } from '../store/slices/markdownSlice';
import { setMode } from '../store/slices/modeSlice';

interface MessageRowProps {
  message: Message;
}

const MessageRow = ({ message }: MessageRowProps) => {
  const dispatch = useDispatch();
  
  const hasMarkdown = (content: string): boolean => {
    // Check for common markdown patterns
    const markdownPatterns = [
      /^#+ .*$/m,  // Headers
      /\[.*\]\(.*\)/,  // Links
      /\*\*.*\*\*/,  // Bold
      /\*.*\*/,  // Italic
      /```[\s\S]*?```/,  // Code blocks
      /^\s*[-*+] /m,  // Lists
      /^\s*\d+\. /m,  // Numbered lists
      /^\s*>/m,  // Blockquotes
      /\|.*\|.*\|/,  // Tables
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  };

  const handleSendToMarkdown = () => {
    dispatch(setMarkdownContent(message.content));
    dispatch(setMode('markdown'));
  };

  return (
    <Box sx={{ 
      py: 1.5,
      px: 2
    }}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          maxWidth: '90%',
          bgcolor: message.role === 'user' ? 'primary.dark' : 'background.paper',
          color: message.role === 'user' ? 'white' : 'text.primary',
          borderRadius: 2,
          boxShadow: (theme) =>
            message.role === 'user'
              ? `0 4px 6px -1px ${theme.palette.primary.dark}20, 0 2px 4px -1px ${theme.palette.primary.dark}10`
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out',
          },
          ml: message.role === 'user' ? 'auto' : '0',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              padding: `0 ${message.role === 'assistant' ? '2rem' : '0'} 0 0`,
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: 1.6,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'inherit',
              display: 'block',
              overflow: 'visible'
            }}
          >
            {message.content}
          </pre>
          {message.role === 'assistant' && message.content && (
            <Box sx={{ position: 'absolute', right: -8, top: -8, display: 'flex', gap: 1 }}>
              {hasMarkdown(message.content) && (
                <Tooltip title="Send to Markdown Editor">
                  <IconButton
                    size="small"
                    onClick={handleSendToMarkdown}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                    aria-label="Send to markdown editor"
                  >
                    <EditNoteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Copy response">
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  sx={{
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
            </Box>
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
