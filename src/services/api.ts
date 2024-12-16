import { Message, APIMessage, StreamResponse, OpenRouterErrorResponse, KeyInfo, MessageContent } from '../types';

const SITE_URL = window.location.origin;
const SITE_NAME = 'Writing Assistant';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const formatMessageForAPI = (msg: Message): APIMessage => {
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

export const checkRateLimit = async (): Promise<boolean> => {
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
      return false;
    }

    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Continue if rate limit check fails
  }
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handleAPIError = (error: OpenRouterErrorResponse): string => {
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

  return errorMessage;
};

export const sendChatRequest = async (messages: Message[], onUpdate: (content: string) => void) => {
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
      messages: messages.map(msg => formatMessageForAPI(msg)),
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
    throw errorData;
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  return processStream(reader, onUpdate);
};

export const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onUpdate: (content: string) => void
) => {
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
            onUpdate(accumulatedContent);
          }

          const error = parsed.choices[0]?.error;
          if (error) {
            throw new Error(error.message);
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
          throw e;
        }
      }
    }
  }

  if (!accumulatedContent) {
    throw new Error('No content was generated after multiple retries');
  }

  return accumulatedContent;
};
