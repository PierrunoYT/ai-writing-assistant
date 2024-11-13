// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  REQUEST_TIMEOUT: 30000,
  MAX_MESSAGE_LENGTH: 4000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  MESSAGES: 'writing_assistant_messages',
  THEME: 'writing_assistant_theme',
  API_KEY: 'writing_assistant_api_key',
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_STORED_MESSAGES: 100,
  MAX_VISIBLE_MESSAGES: 50,
  MESSAGE_CHUNK_SIZE: 10,
};

// Rate Limiting
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60,
  WINDOW_MS: 60000,
};

// Document Mode Configuration
export const DOCUMENT_CONFIG = {
  MAX_DOCUMENT_LENGTH: 10000,
  MAX_COMMENTS: 50,
};

// Application Information
export const APP_INFO = {
  NAME: 'Writing Assistant',
  VERSION: '1.0.0',
  SITE_URL: window.location.origin,
};

// Error Messages
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  API_KEY_MISSING: 'API key is required. Please check your settings.',
  API_ERROR: 'An error occurred while communicating with the API.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_INPUT: 'Invalid input. Please check your message.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Validation
export const VALIDATION = {
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 4000,
  ALLOWED_FILE_TYPES: ['.txt', '.md', '.doc', '.docx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
