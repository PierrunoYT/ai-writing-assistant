import { useState } from 'react';
import { Box, Paper, Typography, Drawer, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  addMessage,
  setLoading,
  setError,
  updateLastMessage,
  createNewConversation,
  setActiveConversation,
  deleteConversation,
  clearCurrentConversation,
  renameConversationAndSave
} from '../store/slices/chatSlice';
import { toggleDrawer } from '../store/slices/settingsSlice';
import MessageList from './MessageList';
import ChatControls from './ChatControls';
import ConversationList from './ConversationList';
import { Message, OpenRouterErrorResponse } from '../types';
import { systemPrompts } from '../prompts/systemPrompts';
import { checkRateLimit, sendChatRequest, handleAPIError } from '../services/api';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from '../constants';

interface ChatInterfaceProps {
  setSystemPromptDialogOpen: (open: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ setSystemPromptDialogOpen }) => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const isDrawerOpen = useSelector((state: RootState) => state.settings.isDrawerOpen);
  const globalSystemPromptId = useSelector((state: RootState) => state.settings.globalSystemPromptId);
  const globalSystemPrompt = useSelector((state: RootState) => state.settings.globalSystemPrompt);
  const currentPrompt = globalSystemPrompt || 
    systemPrompts.find((p) => p.id === (globalSystemPromptId || 'default'))?.prompt || '';
  const { conversations, activeConversationId, isLoading } = useSelector((state: RootState) => state.chat);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const canProceed = await checkRateLimit();
    if (!canProceed) {
      dispatch(setError('API key has reached its credit limit'));
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    dispatch(setLoading(true));
    setInput('');

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
    };
    dispatch(addMessage(assistantMessage));

    let retries = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    while (retries < MAX_RETRIES) {
      try {
        const systemMessage: Message = {
          id: 'system',
          content: currentPrompt,
          role: 'system',
          timestamp: Date.now()
        };

        const allMessages = [
          systemMessage,
          ...messages,
          userMessage
        ];

        await sendChatRequest(allMessages, (content) => {
          dispatch(updateLastMessage({
            ...assistantMessage,
            content
          }));
        });
        break;
      } catch (error) {
        console.error('Chat error:', error);
        retries++;
        
        if (error && typeof error === 'object' && 'error' in error) {
          const apiError = error as OpenRouterErrorResponse;
          dispatch(setError(handleAPIError(apiError)));
          if (![408, 502, 503].includes(apiError.error.code)) {
            break;
          }
        }
        
        if (retries === MAX_RETRIES) {
          dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
        } else {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }

    dispatch(setLoading(false));
  };

  return (
    <Box component="div" sx={{ 
      display: 'flex',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <Drawer
        variant="permanent"
        sx={{
          width: isDrawerOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: isDrawerOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
            overflowX: 'hidden',
            '& > *:not(:first-child)': {
              opacity: isDrawerOpen ? 1 : 0,
              visibility: isDrawerOpen ? 'visible' : 'hidden',
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
            }
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <IconButton onClick={() => dispatch(toggleDrawer())}>
            {isDrawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId || ''}
          onConversationSelect={(id) => dispatch(setActiveConversation(id))}
          onNewConversation={() => dispatch(createNewConversation())}
          onDeleteConversation={(id) => dispatch(deleteConversation(id))}
          onRenameConversation={async (id, title) => {
            try {
              await dispatch(renameConversationAndSave({ id, title })).unwrap();
            } catch (error) {
              dispatch(setError('Failed to rename conversation'));
            }
          }}
        />
      </Drawer>

      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minWidth: 0,
        height: '100%',
        ml: isDrawerOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
        transition: 'margin-left 0.3s ease',
        position: 'relative'
      }}>
        <Box sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 2,
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          right: isDrawerOpen ? `${DRAWER_WIDTH/2}px` : `${COLLAPSED_WIDTH/2}px`,
          transition: 'right 0.3s ease'
        }}>
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'text.secondary',
                p: 3
              }}>
                <Typography variant="body1">
                  Welcome! Type your message below to start a conversation.
                </Typography>
              </Box>
            ) : (
              <MessageList messages={messages} />
            )}
          </Paper>

          <ChatControls
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            hasMessages={messages.length > 0}
            onSubmit={handleSubmit}
            onOpenPromptDialog={() => setSystemPromptDialogOpen(true)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;
