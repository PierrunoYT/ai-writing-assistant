# AI Writing Assistant

A modern AI writing assistant built with React, TypeScript, and local storage, featuring real-time chat with OpenRouter AI.

## Features

- Real-time chat interface with AI
- User authentication (sign up/sign in)
- Dark mode UI
- Responsive design
- Message history
- Local storage persistence

## Tech Stack

- Frontend: React + TypeScript
- State Management: Redux Toolkit
- UI Framework: Material-UI (MUI)
- Storage: Local Storage
- AI Integration: OpenRouter API

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
├── components/        # React components
├── store/            # Redux store and slices
├── types/            # TypeScript type definitions
├── App.tsx           # Main App component
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

This project is licensed under the MIT License - see the LICENSE file for details.
