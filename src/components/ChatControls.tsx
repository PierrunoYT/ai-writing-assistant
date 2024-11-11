import React from 'react';
import { Box, TextField, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import { useDispatch } from 'react-redux';
import { clearMessages } from '../store/slices/chatSlice';

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
        sx={{ bgcolor: 'background.paper' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
              onSubmit(formEvent);
            }
          }
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || !input.trim()}
        endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        sx={{ minWidth: '120px' }}
      >
        Send
      </Button>
      {hasMessages && (
        <Tooltip title="Clear chat">
          <IconButton
            onClick={() => dispatch(clearMessages())}
            color="error"
            disabled={isLoading}
            sx={{ 
              borderRadius: '50%',
              '&:hover': {
                bgcolor: (theme) => theme.palette.error.light,
                color: 'white'
              }
            }}
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
            borderRadius: '50%',
            '&:hover': {
              bgcolor: (theme) => theme.palette.primary.light,
              color: 'white'
            }
          }}
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
            borderRadius: '50%',
            '&:hover': {
              bgcolor: (theme) => theme.palette.primary.light,
              color: 'white'
            }
          }}
        >
          {isDocumentMode ? <ChatIcon /> : <DescriptionIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ChatControls;
