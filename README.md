# AI Writing Assistant

A modern AI writing assistant built with React, TypeScript, and local storage, featuring real-time chat with OpenRouter AI. Supports both chat and document editing modes for versatile writing assistance.

## Features

- Real-time chat interface with AI
- Document editing mode with AI assistance
- Customizable system prompts
- Dark/Light mode UI
- Responsive design
- Message history
- Local storage persistence
- OpenRouter AI integration
- TypeScript support for robust development

## Tech Stack

- Frontend: React + TypeScript + Vite
- State Management: Redux Toolkit
- UI Framework: Material-UI (MUI)
- Storage: Local Storage
- AI Integration: OpenRouter API
- Development Tools:
  - ESLint for code quality
  - TypeScript for type safety
  - Vite for fast development and building

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd writing-assistant
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
│   ├── DocumentEditor
│   ├── DocumentMode
│   ├── Layout
│   ├── MessageList
│   └── SystemPromptDialog
├── prompts/          # System prompts configuration
├── services/         # API services
├── store/           # Redux store setup
│   └── slices/      # Redux slices
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── App.tsx          # Main App component
└── main.tsx         # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

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
