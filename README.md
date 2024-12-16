# AI Writing Assistant

A modern AI writing assistant built with React, TypeScript, and local storage, featuring real-time chat with OpenRouter AI. Supports both chat and document editing modes for versatile writing assistance.

## Features

- Real-time chat interface with AI
- Document editing mode with AI assistance
- Advanced markdown editor with toolbar support
- Conversation history management
- Customizable system prompts with dedicated editor
- Dark/Light mode theme support
- Responsive design
- Message history with persistence
- Local storage for data persistence
- OpenRouter AI integration
- TypeScript support for robust development
- Error boundary for graceful error handling
- Markdown editor support

## Tech Stack

- Frontend: React + TypeScript + Vite
- UI Components: shadcn/ui
- State Management: Redux Toolkit
- Storage: Local Storage
- AI Integration: OpenRouter API
- Development Tools:
  - ESLint for code quality
  - TypeScript for type safety
  - Vite for fast development and building
  - Vitest for testing

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenRouter API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/PierrunoYT/ai-writing-assistant.git
cd ai-writing-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your configuration:
```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # React components
│   ├── ChatControls
│   ├── ChatInput
│   ├── ChatInterface
│   ├── ConversationList
│   ├── DocumentEditor
│   ├── EditorToolbar    # Markdown editor toolbar
│   ├── ErrorBoundary
│   ├── Layout
│   ├── MarkdownEditor
│   ├── MessageList
│   ├── SystemPromptEditor # System prompt customization
│   └── SystemPromptDialog
├── config/          # Configuration constants
├── prompts/         # System prompts configuration
├── services/        # API services
├── store/          # Redux store setup
│   └── slices/     # Redux slices (chat, markdown, mode, settings, theme)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
│   ├── apiUtils    # API-related utilities
│   ├── errorUtils  # Error handling utilities
│   └── fileStorage # Storage utilities
├── App.tsx         # Main App component
└── main.tsx        # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript type checking

## Features in Detail

### Chat Mode
- Real-time conversation with AI
- Message history persistence
- Customizable system prompts with dedicated editor interface
- Conversation management
- Rich text formatting support

### Document Mode
- Advanced markdown editor with formatting toolbar
- AI-assisted writing
- Document state persistence
- Real-time preview
- Rich text editing capabilities

### System Features
- Error boundary for graceful error handling
- Theme switching (Dark/Light mode)
- Local storage persistence
- Responsive design for all devices
- Settings management through Redux
- System prompt customization

## Editor Features

The application includes a powerful markdown editor with the following capabilities:
- Formatting toolbar for common markdown operations
- Real-time preview of markdown content
- Support for common markdown syntax
- Keyboard shortcuts for efficient editing
- Custom system prompt editor for AI behavior configuration
- Auto-save functionality
- Responsive design that works on all devices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

PierrunoYT (2024)