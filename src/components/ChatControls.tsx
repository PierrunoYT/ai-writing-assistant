import React from 'react';
import { Box, TextField, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import MarkdownIcon from '@mui/icons-material/Description';
import DocumentIcon from '@mui/icons-material/Article';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentConversation } from '../store/slices/chatSlice';
import { setMode } from '../store/slices/modeSlice';
import { setMarkdownContent } from '../store/slices/markdownSlice';
import { createDocument, updateDocumentContent, setCurrentDocument } from '../store/slices/documentSlice';
import { RootState } from '../store';

// Selectors
const selectActiveConversationMessages = (state: RootState) => {
  const activeConversation = state.chat.conversations.find(
    c => c.id === state.chat.activeConversationId
  );
  return activeConversation?.messages || [];
};

const selectLatestDocument = (state: RootState) => {
  const documents = state.document.documents;
  return documents[documents.length - 1];
};

interface ChatControlsProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  hasMessages: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenPromptDialog: () => void;
}

const convertChatToMarkdown = (messages: Array<{ role: string; content: string }>) => {
  return messages.map(msg => {
    const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
    return `### ${role}\n\n${msg.content}\n`;
  }).join('\n');
};

const ChatControls: React.FC<ChatControlsProps> = ({
  input,
  setInput,
  isLoading,
  hasMessages,
  onSubmit,
  onOpenPromptDialog,
}) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectActiveConversationMessages);
  const latestDocument = useSelector(selectLatestDocument);

  const handleExportToMarkdown = () => {
    const markdownContent = convertChatToMarkdown(messages);
    dispatch(setMarkdownContent(markdownContent));
    dispatch(setMode('markdown'));
  };

  const handleSendToDocument = () => {
    // Get only the assistant messages as they contain the responses
    const content = messages
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content)
      .join('\n\n');
    
    // Create a new document with the chat content
    dispatch(createDocument({ 
      title: `Chat Document - ${new Date().toLocaleString()}`
    }));
    
    // Use setTimeout to ensure document is created before updating
    setTimeout(() => {
      if (latestDocument) {
        dispatch(updateDocumentContent({ 
          id: latestDocument.id, 
          content 
        }));
        dispatch(setCurrentDocument(latestDocument.id));
        dispatch(setMode('document'));
      }
    }, 0);
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        position: 'sticky',
        bottom: 16,
        zIndex: 1,
        width: '100%',
        alignItems: 'center',
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
              const form = e.currentTarget.closest('form');
              if (form) {
                form.requestSubmit();
              }
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
          <span>
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
          </span>
        </Tooltip>
      )}
      <Tooltip title="System Prompt">
        <span>
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
        </span>
      </Tooltip>

      {hasMessages && (
        <>
          <Tooltip title="Export to Markdown">
            <span>
              <IconButton
                onClick={handleExportToMarkdown}
                color="primary"
                disabled={isLoading}
                sx={{ 
                  height: '56px',
                  width: '56px',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.primary.light,
                    color: 'white'
                  }
                }}
                aria-label="Export chat to markdown"
              >
                <MarkdownIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Send to Document">
            <span>
              <IconButton
                onClick={handleSendToDocument}
                color="primary"
                disabled={isLoading}
                sx={{ 
                  height: '56px',
                  width: '56px',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.primary.light,
                    color: 'white'
                  }
                }}
                aria-label="Send chat to document"
              >
                <DocumentIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default ChatControls;
