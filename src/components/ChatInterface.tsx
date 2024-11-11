import { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setLoading, setError, updateLastMessage } from '../store/slices/chatSlice';
import MessageList from './MessageList';
import ChatControls from './ChatControls';
import SystemPromptDialog from './SystemPromptDialog';
import DocumentEditor from './DocumentEditor';
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
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const canProceed = await checkRateLimit();
    if (!canProceed) {
      dispatch(setError('API key has reached its credit limit'));
      return;
    }

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
      id: Date.now().toString(),
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
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden'
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
              p: 2, 
              overflow: 'auto',
              bgcolor: 'background.paper',
              mb: 2
            }}
          >
            <MessageList messages={messages} />
          </Paper>

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

          <Box sx={{ flexShrink: 0 }}>
            <ChatControls
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              hasMessages={messages.length > 0}
              isDocumentMode={isDocumentMode}
              onSubmit={handleSubmit}
              onOpenPromptDialog={() => setIsPromptDialogOpen(false)}
              onToggleDocumentMode={() => {
                if (!isDocumentMode) {
                  // When switching to document mode, set some initial content
                  setDocumentContent(messages.length > 0 ? 
                    messages[messages.length - 1].content : 
                    'Enter or paste your text here to begin adding comments.');
                }
                setIsDocumentMode(!isDocumentMode);
                setDocumentComments([]);
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChatInterface;
