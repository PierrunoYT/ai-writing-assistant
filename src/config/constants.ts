// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  REQUEST_TIMEOUT: 30000,
  MAX_MESSAGE_LENGTH: 4000,
  ENDPOINTS: {
    CHAT: 'https://openrouter.ai/api/v1/chat/completions',
    AUTH: 'https://openrouter.ai/api/v1/auth/key',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  MESSAGES: 'writing_assistant_messages',
  THEME: 'writing_assistant_theme',
  API_KEY: 'writing_assistant_api_key',
  USER_PREFERENCES: 'writing_assistant_preferences',
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_STORED_MESSAGES: 100,
  MAX_VISIBLE_MESSAGES: 50,
  MESSAGE_CHUNK_SIZE: 10,
  VIRTUALIZATION: {
    OVERSCAN_COUNT: 5,
    ROW_HEIGHT: 100,
  },
};

// Rate Limiting
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60,
  WINDOW_MS: 60000,
  BACKOFF_MULTIPLIER: 2,
};

// Document Mode Configuration
export const DOCUMENT_CONFIG = {
  MAX_DOCUMENT_LENGTH: 10000,
  MAX_COMMENTS: 50,
  AUTOSAVE_INTERVAL: 30000,
};

// Application Information
export const APP_INFO = {
  NAME: 'Writing Assistant',
  VERSION: '1.0.0',
  SITE_URL: window.location.origin,
  SUPPORT_EMAIL: 'support@example.com',
};

// Error Messages
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  API_KEY_MISSING: 'API key is required. Please check your settings.',
  API_ERROR: 'An error occurred while communicating with the API.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_INPUT: 'Invalid input. Please check your message.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  DOCUMENT_TOO_LARGE: 'Document exceeds maximum allowed size.',
  UNAUTHORIZED: 'Unauthorized. Please check your API key.',
  INSUFFICIENT_CREDITS: 'Insufficient credits. Please add more credits.',
  CONTENT_FILTERED: 'Content was filtered due to policy violation.',
};

// Validation
export const VALIDATION = {
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 4000,
  ALLOWED_FILE_TYPES: ['.txt', '.md', '.doc', '.docx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  INPUT_PATTERNS: {
    API_KEY: /^[a-zA-Z0-9-_]{32,}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Accessibility
export const ACCESSIBILITY = {
  ANIMATION_REDUCED: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  MIN_CONTRAST_RATIO: 4.5,
  FOCUS_VISIBLE: true,
  SCREEN_READER_MESSAGES: {
    LOADING: 'Loading, please wait...',
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    NEW_MESSAGE: 'New message received',
  },
};
