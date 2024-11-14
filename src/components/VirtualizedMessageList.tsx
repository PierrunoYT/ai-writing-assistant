import React, { useRef, useState, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Message } from '../types';

interface MessageRowProps {
  data: Message[];
  index: number;
  style: React.CSSProperties;
}

const MessageRow = ({ data, index, style }: MessageRowProps) => {
  const message = data[index];
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.getBoundingClientRect().height);
    }
  }, [message.content]);

  return (
    <div style={{
      ...style,
      height: 'auto',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '16px',
      paddingRight: '16px',
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
        <Box sx={{ position: 'relative' }} ref={contentRef}>
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
    </div>
  );
};

interface VirtualizedMessageListProps {
  messages: Message[];
}

const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
}) => {
  const listRef = useRef<List>(null);
  const [listKey, setListKey] = useState(0);

  const getItemSize = (index: number) => {
    const baseHeight = 120; // Increased base height
    const message = messages[index];
    const lineCount = message.content.split('\n').length;
    const charCount = message.content.length;
    
    // More generous height calculation
    return Math.max(baseHeight, (lineCount * 28) + (Math.floor(charCount / 40) * 28) + 48);
  };

  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
      listRef.current.resetAfterIndex(0);
      setListKey(prev => prev + 1);
    }
  }, [messages]);

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      '& .simplebar-content': {
        height: '100%',
        minHeight: '100%'
      }
    }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            key={listKey}
            ref={listRef}
            height={height}
            itemCount={messages.length}
            itemSize={getItemSize}
            width={width}
            itemData={messages}
            overscanCount={5}
          >
            {MessageRow}
          </List>
        )}
      </AutoSizer>
    </Box>
  );
};

export default VirtualizedMessageList;
