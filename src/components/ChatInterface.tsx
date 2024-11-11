import { useState } from 'react';
import { Box, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setLoading, setError, updateLastMessage } from '../store/slices/chatSlice';
import SendIcon from '@mui/icons-material/Send';
import MessageList from './MessageList';
import { Message, StreamResponse, APIMessage, MessageContent } from '../types';

const SITE_URL = window.location.origin;
const SITE_NAME = 'Writing Assistant';

const formatMessageForAPI = (msg: Message): APIMessage => {
  // For system messages or large content, use cache control
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
  
  // For regular messages, use simple format
  return {
    role: msg.role,
    content: msg.content
  };
};

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, assistantMessage: Message) => {
    try {
      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          // Skip SSE comments
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

              // Handle any errors in the response
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

    try {
      const allMessages = [
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
          model: 'anthropic/claude-3-haiku',
          messages: allMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          transforms: ['middle-out'] // Enable middle-out compression for long conversations
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `API request failed with status ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      await processStream(reader, assistantMessage);

    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      console.error('Chat error:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          bgcolor: 'background.paper' 
        }}
      >
        <MessageList messages={messages} />
      </Paper>

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
      </Box>
    </Box>
  );
};

export default ChatInterface;
