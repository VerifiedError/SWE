# Open SWE AI Coding Agent

A comprehensive React application featuring an AI-powered coding agent with multi-agent architecture for autonomous software development tasks.

## Features

- **Multi-Agent Architecture**: Manager, Planner, and Programmer agents work together
- **Real-time Collaboration**: WebSocket-powered chat interface for human-in-the-loop interactions
- **Task Management**: Create, track, and manage coding tasks with progress tracking
- **Mobile Responsive**: Fully optimized for mobile devices with collapsible sidebar
- **AI Integration**: Powered by Anthropic Claude and OpenAI for intelligent code analysis and generation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Real-time**: WebSocket connections
- **AI Services**: Anthropic Claude 4.0 Sonnet + OpenAI GPT-4o

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- API keys for Anthropic and/or OpenAI

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```
   ANTHROPIC_API_KEY=your_anthropic_key
   OPENAI_API_KEY=your_openai_key  
   DATABASE_URL=your_postgres_connection_string
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Usage

1. **Create Tasks**: Click the "New" button to create coding tasks
2. **Select Tasks**: Click on any task in the Active Tasks list to start collaborating
3. **Chat with AI**: Use the chat interface to communicate with AI agents
4. **Track Progress**: Monitor task progress and agent status in real-time

## Architecture

### Frontend Components

- **Dashboard**: Main interface with stats, task list, and chat
- **TaskList**: Displays active tasks with progress tracking
- **ChatInterface**: Real-time communication with AI agents
- **Sidebar**: Navigation and task management

### Backend Services

- **AI Service**: Handles Claude and OpenAI integrations
- **Storage**: In-memory and database storage interfaces
- **WebSocket**: Real-time communication layer
- **Routes**: RESTful API endpoints

### Multi-Agent System

1. **Manager Agent**: Entry point, analyzes tasks and coordinates workflow
2. **Planner Agent**: Creates detailed execution plans and architecture decisions  
3. **Programmer Agent**: Implements code changes and handles execution

## Development

The application uses modern React patterns:

- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Wouter** for lightweight routing
- **WebSocket** integration for real-time updates

## Deployment

The app is designed to work seamlessly on Replit and other platforms:

```bash
npm run build  # Build for production
npm start      # Start production server
```

## Mobile Support

Fully responsive design with:
- Collapsible sidebar navigation
- Touch-friendly interfaces
- Optimized layouts for all screen sizes
- Mobile-first responsive breakpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details