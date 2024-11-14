import React from 'react';
import { Box, TextField, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import { useDispatch } from 'react-redux';
import { clearCurrentConversation } from '../store/slices/chatSlice';

interface ChatControlsProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  hasMessages: boolean;
  isDocumentMode: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenPromptDialog: () => void;
  onToggleDocumentMode: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  input,
  setInput,
  isLoading,
  hasMessages,
  isDocumentMode,
  onSubmit,
  onOpenPromptDialog,
  onToggleDocumentMode,
}) => {
  const dispatch = useDispatch();

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        width: '100%'
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        disabled={isLoading}
        sx={{ 
          bgcolor: 'background.paper',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
              onSubmit(formEvent);
            }
          }
        }}
        aria-label="Chat message input"
        inputProps={{
          'aria-describedby': 'message-input-help',
        }}
      />
      <span id="message-input-help" className="sr-only">
        Press Enter to send your message, or Shift+Enter for a new line
      </span>
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || !input.trim()}
        endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        sx={{ 
          minWidth: '120px',
          height: '56px' // Match TextField height
        }}
        aria-label={isLoading ? "Sending message..." : "Send message"}
      >
        Send
      </Button>
      {hasMessages && (
        <Tooltip title="Clear chat">
          <IconButton
            onClick={() => dispatch(clearCurrentConversation())}
            color="error"
            disabled={isLoading}
            sx={{ 
              height: '56px', // Match TextField height
              width: '56px',
              borderRadius: 2,
              '&:hover': {
                bgcolor: (theme) => theme.palette.error.light,
                color: 'white'
              }
            }}
            aria-label="Clear chat history"
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="System Prompt">
        <IconButton
          onClick={onOpenPromptDialog}
          color="primary"
          disabled={isLoading}
          sx={{ 
            height: '56px', // Match TextField height
            width: '56px',
            borderRadius: 2,
            '&:hover': {
              bgcolor: (theme) => theme.palette.primary.light,
              color: 'white'
            }
          }}
          aria-label="Open system prompt settings"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={isDocumentMode ? "Switch to Chat Mode" : "Switch to Document Mode"}>
        <IconButton
          onClick={onToggleDocumentMode}
          color="primary"
          disabled={isLoading}
          sx={{ 
            height: '56px', // Match TextField height
            width: '56px',
            borderRadius: 2,
            '&:hover': {
              bgcolor: (theme) => theme.palette.primary.light,
              color: 'white'
            }
          }}
          aria-label={isDocumentMode ? "Switch to chat mode" : "Switch to document mode"}
        >
          {isDocumentMode ? <ChatIcon /> : <DescriptionIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ChatControls;
