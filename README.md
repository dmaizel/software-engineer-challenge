# Express API Service Template (TypeScript)

A modern, production-ready Node.js Express API service template built with TypeScript.

## Features

- ⚡ **TypeScript** - Full TypeScript support with strict type checking
- 🚀 **Express.js** - Fast, unopinionated web framework
- 🛡️ **Security** - Helmet.js for security headers
- 🔒 **CORS** - Cross-Origin Resource Sharing support
- 📝 **Logging** - Morgan HTTP request logger
- 🧪 **Testing** - Jest testing framework with TypeScript support
- 📏 **Linting** - ESLint with TypeScript rules
- 🔄 **Hot Reload** - Nodemon for development
- 📦 **Build System** - TypeScript compiler with source maps

## Project Structure

```
src/
├── app.ts              # Main application entry point
├── routes/
│   └── index.ts        # Main routes
├── middleware/
│   └── errorHandler.ts # Custom error handling
├── types/
│   └── index.ts        # TypeScript type definitions
└── __tests__/          # Test files
```

## Getting Started

### Prerequisites

- Node.js (>= 16.0.0)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-api-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Routes
- `GET /api/v1/` - Welcome message
- `GET /api/v1/users` - Get users (example)
- `POST /api/v1/users` - Create user (example)

## Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Import and use it in `src/routes/index.ts`

Example:
```typescript
// src/routes/users.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ users: [] });
});

export default router;
```

### Adding Middleware

Create middleware functions in `src/middleware/` and import them in `src/app.ts`.

### TypeScript Types

Define your types in `src/types/index.ts` and import them where needed.

## Testing

Run tests with:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Production

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details
