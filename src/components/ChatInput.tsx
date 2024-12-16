import { Box, TextField, Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  hasMessages: boolean;
  isDocumentMode: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClearChat: () => void;
  onOpenPromptDialog: () => void;
  onToggleDocumentMode: () => void;
}

const ChatInput = ({
  input,
  isLoading,
  hasMessages,
  isDocumentMode,
  onInputChange,
  onSubmit,
  onClearChat,
  onOpenPromptDialog,
  onToggleDocumentMode
}: ChatInputProps) => {
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
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        disabled={isLoading}
        sx={{ 
          bgcolor: 'background.paper',
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: 'rgba(0, 0, 0, 0.38)'
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && input.trim()) {
              const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
              onSubmit(formEvent);
            }
          }
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading}
        endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        sx={{ minWidth: '120px' }}
      >
        Send
      </Button>
      {hasMessages && (
        <Tooltip title="Clear chat">
          <IconButton
            onClick={onClearChat}
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

export default ChatInput;
