import { useState } from 'react';
import { Box, TextField, Button, Paper, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setLoading, setError, updateLastMessage, clearMessages } from '../store/slices/chatSlice';
import SendIcon from '@mui/icons-material/Send';
import MessageList from './MessageList';
import { Message, StreamResponse, APIMessage, MessageContent, OpenRouterErrorResponse, KeyInfo } from '../types';

const SITE_URL = window.location.origin;
const SITE_NAME = 'Writing Assistant';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const formatMessageForAPI = (msg: Message): APIMessage => {
  if (msg.role === 'system' || msg.content.length > 1000) {
    const content: MessageContent[] = [{
      type: 'text',
      text: msg.content,
      cache_control: {
        type: 'ephemeral'
      }
    }];
    return {
      role: msg.role,
      content
    };
  }
  
  return {
    role: msg.role,
    content: msg.content
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  const checkRateLimit = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check rate limit');
      }

      const keyInfo: KeyInfo = await response.json();
      const { usage, limit } = keyInfo.data;

      if (limit !== null && usage >= limit) {
        dispatch(setError('API key has reached its credit limit'));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Continue if rate limit check fails
    }
  };

  const handleError = (error: OpenRouterErrorResponse) => {
    const { code, message, metadata } = error.error;
    let errorMessage = message;

    switch (code) {
      case 400:
        errorMessage = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        errorMessage = 'Authentication failed. Please check your API key.';
        break;
      case 402:
        errorMessage = 'Insufficient credits. Please add more credits to continue.';
        break;
      case 403:
        if (metadata?.reasons) {
          errorMessage = `Content moderation error: ${metadata.reasons.join(', ')}`;
          if (metadata.flagged_input) {
            errorMessage += `\nFlagged content: "${metadata.flagged_input}"`;
          }
        }
        break;
      case 408:
        errorMessage = 'Request timed out. Please try again.';
        break;
      case 429:
        errorMessage = 'Rate limit exceeded. Please wait before trying again.';
        break;
      case 502:
        errorMessage = 'The selected model is currently unavailable. Please try again later.';
        break;
      case 503:
        errorMessage = 'No available model providers. Please try again later.';
        break;
    }

    dispatch(setError(errorMessage));
  };

  const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, assistantMessage: Message) => {
    try {
      let accumulatedContent = '';
      let noContentRetries = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (!accumulatedContent && noContentRetries < MAX_RETRIES) {
            noContentRetries++;
            await delay(RETRY_DELAY);
            continue;
          }
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith(':')) continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data) as StreamResponse;
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                accumulatedContent += content;
                dispatch(updateLastMessage({
                  ...assistantMessage,
                  content: accumulatedContent
                }));
              }

              const error = parsed.choices[0]?.error;
              if (error) {
                throw new Error(error.message);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
              if (e instanceof Error) {
                dispatch(setError(e.message));
              }
            }
          }
        }
      }

      if (!accumulatedContent) {
        throw new Error('No content was generated after multiple retries');
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      if (error instanceof Error) {
        dispatch(setError(error.message));
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const canProceed = await checkRateLimit();
    if (!canProceed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    dispatch(setLoading(true));
    setInput('');

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: Date.now() + 1,
    };
    dispatch(addMessage(assistantMessage));

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const allMessages = [
          {
            role: 'system' as const,
            content: systemPrompt
          },
          ...messages.map((msg: Message) => formatMessageForAPI(msg)),
          formatMessageForAPI(userMessage)
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'HTTP-Referer': SITE_URL,
            'X-Title': SITE_NAME,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-5-haiku',
            messages: allMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
            transforms: ['middle-out']
          }),
        });

        if (!response.ok) {
          const errorData: OpenRouterErrorResponse = await response.json();
          handleError(errorData);
          
          // Only retry on specific error codes
          if ([408, 502, 503].includes(errorData.error.code)) {
            retries++;
            if (retries < MAX_RETRIES) {
              await delay(RETRY_DELAY);
              continue;
            }
          }
          return;
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        await processStream(reader, assistantMessage);
        break;

      } catch (error) {
        console.error('Chat error:', error);
        retries++;
        
        if (retries === MAX_RETRIES) {
          dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
        } else {
          await delay(RETRY_DELAY);
        }
      }
    }

    dispatch(setLoading(false));
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          bgcolor: 'background.paper',
          position: 'relative'
        }}
      >
        <MessageList messages={messages} />
      </Paper>

      <Dialog
        open={isPromptDialogOpen}
        onClose={() => setIsPromptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>System Prompt</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter system prompt..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPromptDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box
        component="form"
        onSubmit={handleSubmit}
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
          placeholder="Type your message..."
          disabled={isLoading}
          sx={{ bgcolor: 'background.paper' }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !input.trim()}
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Send
        </Button>
        {messages.length > 0 && (
          <Tooltip title="Clear chat">
            <IconButton
              onClick={() => dispatch(clearMessages())}
              color="error"
              disabled={isLoading}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="System Prompt">
          <IconButton
            onClick={() => setIsPromptDialogOpen(true)}
            color="primary"
            disabled={isLoading}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatInterface;
