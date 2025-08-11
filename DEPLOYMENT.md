# Deployment Guide - Open SWE AI Coding Agent

## React Application Deployment

This is a full-stack React application ready for production deployment.

### Quick Deploy on Replit

1. **Environment Setup**: Ensure these secrets are configured:
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `DATABASE_URL` - PostgreSQL connection string

2. **Deploy**: Click the Deploy button in Replit
   - The app will automatically build and deploy
   - Production URL will be provided

### Manual Deployment

#### Build for Production
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

### Environment Variables

Required:
```
NODE_ENV=production
ANTHROPIC_API_KEY=your_anthropic_key
DATABASE_URL=postgresql://user:pass@host:port/db
```

Optional:
```
OPENAI_API_KEY=your_openai_key
PORT=5000
```

### Database Setup

1. **Create PostgreSQL Database**
2. **Run Migrations**:
   ```bash
   npm run db:push
   ```

### Features Ready for Production

✅ **React Frontend**: Modern React 18 with TypeScript
✅ **Express Backend**: Production-ready API server
✅ **WebSocket Support**: Real-time communication
✅ **Database Integration**: PostgreSQL with Drizzle ORM
✅ **Mobile Responsive**: Optimized for all devices
✅ **AI Integration**: Claude 4.0 and GPT-4o support
✅ **Error Handling**: Comprehensive error boundaries
✅ **Security**: Production security headers
✅ **Performance**: Optimized builds and caching

### Performance Optimizations

- Vite-powered build system for fast compilation
- React Query for intelligent caching
- WebSocket connection pooling
- Database connection pooling
- Lazy-loaded components
- Optimized bundle sizes

### Monitoring

The application includes:
- Real-time task tracking
- Agent status monitoring  
- Error logging and reporting
- Performance metrics
- User activity tracking

### Scaling Considerations

- **Horizontal Scaling**: Multiple server instances supported
- **Database**: PostgreSQL with connection pooling
- **WebSocket**: Clustered WebSocket support
- **Caching**: React Query client-side caching
- **CDN Ready**: Static assets optimized for CDN delivery

### Security Features

- Environment variable protection
- CORS configuration
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM
- XSS protection with proper sanitization
- HTTPS enforcement in production