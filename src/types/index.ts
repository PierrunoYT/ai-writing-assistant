export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

// OpenRouter API Types
export interface StreamingChoice {
  finish_reason: string | null;
  delta: {
    content: string | null;
    role?: string;
    tool_calls?: ToolCall[];
  };
  error?: APIError;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface APIError {
  code: number;
  message: string;
  metadata?: ModerationErrorMetadata;
}

export interface ModerationErrorMetadata {
  reasons: string[];
  flagged_input: string;
}

export interface OpenRouterErrorResponse {
  error: APIError;
}

export interface RateLimitInfo {
  requests: number;
  interval: string;
}

export interface KeyInfo {
  data: {
    label: string;
    usage: number;
    limit: number | null;
    is_free_tier: boolean;
    rate_limit: RateLimitInfo;
  };
}

export interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface CommentReply {
  id: string;
  content: string;
  timestamp: number;
  author?: string;
}

export interface Comment {
  id: string;
  content: string;
  position: {
    start: number;
    end: number;
  };
  timestamp: number;
  status: 'open' | 'resolved';
  highlightColor?: string;
  replies: CommentReply[];
}

export interface DocumentState {
  content: string;
  comments: Comment[];
  isEditMode: boolean;
}

export interface StreamResponse {
  id: string;
  choices: StreamingChoice[];
  created: number;
  model: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  system_fingerprint?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// OpenRouter Message Types
export interface MessageContent {
  type: 'text';
  text: string;
  cache_control?: {
    type: 'ephemeral';
  };
}

export interface APIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}
