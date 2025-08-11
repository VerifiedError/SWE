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
- **Advanced SWE Agent Panel** with tabbed interface for autonomous software analysis and implementation

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **Enhanced Multi-agent system** with specialized AI agents:
  - Manager Agent: Entry point and task orchestration
  - Planner Agent: Creates detailed execution plans with SWE Agent integration
  - Programmer Agent: Implements code changes
  - **Advanced SWE Agent**: Python-based intelligent code analysis, generation, and validation (850+ lines)
- **WebSocket server** for real-time bidirectional communication between clients and agents
- **In-memory storage** with interface abstraction (IStorage) allowing for future database integration
- **Modular service architecture** with separate AI, GitHub, and SWE Agent service layers
- **Enhanced API endpoints** for SWE Agent functionality: `/api/swe/analyze`, `/api/swe/implement`, `/api/swe/validate`

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
- **Advanced SWE Agent System** with sophisticated code analysis and generation capabilities:
  - Autonomous issue analysis and root cause identification
  - Solution plan generation with detailed change specifications
  - Code implementation with diff generation and validation
  - Test case generation and quality assessment
  - Real-time validation with scoring system (0-10 scale)
- **Enhanced Multi-agent Workflow**:
  - Manager Agent for task orchestration and complexity assessment
  - Planner Agent with SWE integration for detailed execution planning
  - Programmer Agent for implementation and code changes
- **Structured AI responses** for plans, code implementations, and task analysis
- **Multi-step execution plans** with estimated time and risk assessments
- **Interactive code quality analysis** with issue detection and improvement suggestions

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

## Recent Updates (January 2025)

### Enhanced SWE Agent Integration
- **Advanced Python SWE Agent (850+ lines)** integrated as core service layer
- **New API endpoints** for autonomous software engineering:
  - `/api/swe/analyze` - Issue analysis and root cause identification
  - `/api/swe/implement` - Solution implementation with code generation
  - `/api/swe/validate` - Solution validation with quality scoring
  - `/api/swe/analyze-code` - Code quality analysis and suggestions
- **Interactive SWE Agent Panel** with multi-step workflow:
  - Step 1: Issue description and code context input
  - Step 2: AI-generated analysis with planned changes
  - Step 3: Implementation with code diff previews
  - Step 4: Validation with quality scores and feedback
- **Enhanced AI Service** with fallback mechanisms and SWE Agent integration
- **Mobile-responsive tabbed interface** for seamless SWE Agent access from dashboard
- **Real-time progress tracking** with visual indicators and step completion status

### Technical Improvements
- **Type-safe SWE Agent interfaces** for solution plans and code changes
- **Error handling and fallback strategies** for robust AI service operations
- **Modular component architecture** with reusable UI components (Tabs, Progress, Textarea)
- **Enhanced dashboard navigation** with task management and SWE Agent modes