# Open SWE AI Coding Agent

## Overview

Open SWE is a comprehensive React application featuring an AI-powered coding agent with multi-agent architecture for autonomous software development tasks. The system provides a modern, mobile-responsive interface where users can create tasks, interact with AI agents in real-time, and monitor progress through an intuitive dashboard. Built as a full-stack React application with TypeScript, it demonstrates best practices for modern web development while showcasing advanced AI integration capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Project Type: React application with full-stack capabilities and AI integration.
Focus: Clean, production-ready code with mobile-responsive design.

## System Architecture

### Frontend Architecture
- **React + TypeScript** with Vite as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **Tailwind CSS** with shadcn/ui component library for consistent, modern UI design
- **TanStack Query** for server state management, caching, and background synchronization
- **React Hook Form** with Zod validation for type-safe form handling
- **WebSocket integration** for real-time updates and agent communication

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **Multi-agent system** with three specialized AI agents:
  - Manager Agent: Entry point and task orchestration
  - Planner Agent: Creates detailed execution plans
  - Programmer Agent: Implements code changes
- **WebSocket server** for real-time bidirectional communication between clients and agents
- **In-memory storage** with interface abstraction (IStorage) allowing for future database integration
- **Modular service architecture** with separate AI and GitHub service layers

### Database Schema Design
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Core entities**: Users, Repositories, Tasks, Messages, Activities
- **Task management** with status tracking (pending, planning, executing, review_required, completed, failed)
- **Agent state tracking** via JSON fields for flexible agent status management
- **Message system** supporting different types (chat, plan, code_diff, system)

### Real-time Communication
- **WebSocket connections** grouped by task ID for efficient message routing
- **Human-in-the-loop** support for interactive task refinement and approval
- **Plan review system** allowing users to approve or request changes to AI-generated plans
- **Live agent status updates** showing current agent activities

### AI Integration
- **Anthropic Claude integration** using the latest claude-sonnet-4-20250514 model
- **Structured AI responses** for plans, code implementations, and task analysis
- **Multi-step execution plans** with estimated time and risk assessments
- **Code diff generation** and implementation tracking

## External Dependencies

### AI Services
- **Anthropic Claude API** for natural language processing and code generation
- Configured with environment variable `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`

### Database
- **Neon PostgreSQL** serverless database with connection pooling
- **Drizzle ORM** for schema management and migrations
- WebSocket support via `ws` library for Neon compatibility

### GitHub Integration
- **GitHub REST API** for repository management, issue tracking, and pull request creation
- Authentication via personal access tokens stored per user
- Support for repository cloning, branch management, and PR workflows

### Development Tools
- **Replit integration** with runtime error modal and cartographer for development environment
- **PostCSS** with Tailwind CSS for styling pipeline
- **ESBuild** for production server bundling

### UI Component System
- **Radix UI primitives** for accessible, unstyled components
- **shadcn/ui** components built on top of Radix for consistent design
- **Lucide React** icons for comprehensive iconography
- **Class Variance Authority** for component variant management

The architecture emphasizes modularity, type safety, and real-time collaboration while maintaining clear separation of concerns between the AI agents, data persistence, and user interface layers.