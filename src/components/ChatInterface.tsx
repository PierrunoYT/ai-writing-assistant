import { useState } from 'react';
import { Box, Paper, Typography, Drawer } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  addMessage, 
  setLoading, 
  setError, 
  updateLastMessage,
  createNewConversation,
  setActiveConversation,
  deleteConversation,
  clearCurrentConversation
} from '../store/slices/chatSlice';
import MessageList from './MessageList';
import ChatControls from './ChatControls';
import SystemPromptDialog from './SystemPromptDialog';
import DocumentEditor from './DocumentEditor';
import ConversationList from './ConversationList';
import { Message, OpenRouterErrorResponse } from '../types';
import { systemPrompts } from '../prompts/systemPrompts';
import { checkRateLimit, sendChatRequest, handleAPIError } from '../services/api';

interface Comment {
  id: string;
  content: string;
  position: {
    start: number;
    end: number;
  };
  timestamp: number;
}

const DRAWER_WIDTH = 300;

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('default');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isDocumentMode, setIsDocumentMode] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [documentComments, setDocumentComments] = useState<Comment[]>([]);

  const currentPrompt = systemPrompts.find((p) => p.id === selectedPromptId)?.prompt || customPrompt;
  const dispatch = useDispatch();
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

  const handleAddComment = (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setDocumentComments([...documentComments, newComment]);
  };

  const handleDeleteComment = (id: string) => {
    setDocumentComments(documentComments.filter(comment => comment.id !== id));
  };

  const handleDocumentReady = () => {
    const prompt = `Please rewrite the following text incorporating these comments:\n\nOriginal Text:\n${documentContent}\n\nComments:\n${documentComments.map(c => (
      `- At "${documentContent.substring(c.position.start, c.position.end)}": ${c.content}`
    )).join('\n')}`;
    
    setInput(prompt);
    setIsDocumentMode(false);
    const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
    handleSubmit(formEvent);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId || ''}
          onConversationSelect={(id) => dispatch(setActiveConversation(id))}
          onNewConversation={() => dispatch(createNewConversation())}
          onDeleteConversation={(id) => dispatch(deleteConversation(id))}
        />
      </Drawer>

      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minWidth: 0,
        height: '100%',
        ml: `${DRAWER_WIDTH}px`,
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
          right: `${DRAWER_WIDTH/2}px`
        }}>
          {isDocumentMode ? (
            <Box sx={{ 
              flex: 1,
              bgcolor: 'background.paper', 
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <DocumentEditor
                content={documentContent}
                comments={documentComments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onReady={handleDocumentReady}
                onChange={setDocumentContent}
              />
            </Box>
          ) : (
            <>
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

              <Box sx={{ flexShrink: 0 }}>
                <ChatControls
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  hasMessages={messages.length > 0}
                  isDocumentMode={isDocumentMode}
                  onSubmit={handleSubmit}
                  onOpenPromptDialog={() => setIsPromptDialogOpen(true)}
                  onToggleDocumentMode={() => setIsDocumentMode(!isDocumentMode)}
                />
              </Box>
            </>
          )}
        </Box>

        <SystemPromptDialog
          open={isPromptDialogOpen}
          onClose={() => setIsPromptDialogOpen(false)}
          selectedPromptId={selectedPromptId}
          setSelectedPromptId={setSelectedPromptId}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          systemPrompts={systemPrompts}
          currentPrompt={currentPrompt}
        />
      </Box>
    </Box>
  );
};

export default ChatInterface;
