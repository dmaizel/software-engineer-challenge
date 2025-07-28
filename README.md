# Log Ingestion and Search System

A distributed log processing system built with Node.js, TypeScript, and MongoDB. This system simulates a production logging infrastructure with multiple microservices working together to ingest, store, and search log data.

## System Architecture

The system consists of four main components:

1. **Mock Queue Server** (Port 3001) - Simulates a message queue provider (like AWS SQS)
2. **Mock Service** - Continuously generates log messages and sends them to the queue
3. **Ingestion Service** - Consumes log messages from the queue and stores them in MongoDB
4. **API Server** (Port 3000) - Provides search endpoints to query the stored logs

## Features

- ⚡ **TypeScript** - Full TypeScript support with strict type checking
- 🚀 **Express.js** - Fast, unopinionated web framework for API endpoints
- 🛡️ **Security** - Helmet.js for security headers
- 🔒 **CORS** - Cross-Origin Resource Sharing support
- 📝 **Logging** - Morgan HTTP request logger
- 🧪 **Testing** - Jest testing framework with TypeScript support
- 📏 **Linting** - ESLint with TypeScript rules
- 🔄 **Hot Reload** - Nodemon for development
- 📦 **Build System** - TypeScript compiler with source maps
- 🗄️ **MongoDB** - Document database for log storage
- 🔍 **Search API** - RESTful endpoints for querying logs

## Project Structure

```
src/
├── app.ts                          # Main API server entry point
├── routes/
│   ├── index.ts                    # Main routes
│   └── searchController/           # Log search functionality
├── microservices/
│   └── ingestion/
│       ├── index.ts                # Log ingestion service
│       └── validation.ts           # Log message validation
├── fake-queue/
│   ├── fake-queue-server.ts        # Mock queue server
│   └── queue.ts                    # Queue implementation
├── logger-sdk/
│   └── logger.ts                   # Logger SDK for services
├── odm/
│   ├── index.ts                    # Database connection
│   └── Logs/                       # Log data models and repository
├── common/
│   └── queue/                      # Queue utilities
└── types/                          # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (>= 16.0.0)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd software-engineer-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Set up mongo docker:
```bash
   docker-compose up -d 
```

4. Start all services (or start each one independently):
```bash
npm run start:all
```

This will start all four services concurrently:
- Mock Queue Server on port 3001
- Mock Service (generating logs)
- Ingestion Service (consuming and storing logs)
- API Server on port 3000

### Individual Service Scripts

- `npm run start:fake-queue` - Start the mock queue server (replaces SQS/AWS MQ)
- `npm run start:mock-service` - Start the mock service that generates log messages
- `npm run start:ingestion` - Start the ingestion service that consumes logs and saves to DB
- `npm run start:api` - Start the API server for searching logs

### Available Scripts

- `npm run start:all` - Start all services concurrently
- `npm run dev` - Start development server with hot reload (API only)
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Endpoints

### Search Logs
- `POST /api/search` - Search logs with query parameters

Example request:
```json
{
  "query": "error",
  "page": 1
}
```

Response:
```json
{
  "results": [
    {
      "message": "This is a test error log",
      "logLevel": "error",
      "serviceName": "test",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

## How It Works

1. **Mock Service** continuously generates log messages (info/error) every 2 seconds and sends them to the queue
2. **Mock Queue Server** acts as a message broker, storing messages in a FIFO queue
3. **Ingestion Service** polls the queue every 5 seconds, consumes messages, validates them, and stores them in MongoDB
4. **API Server** provides search endpoints to query the stored logs with pagination support

## Development

### Adding New Log Levels

Modify the `logBankMessageBank` in `dev/mockServiceLog.ts` to add new log levels and messages.

### Extending Search Functionality

Add new search parameters in `src/routes/searchController/validation.ts` and update the search logic in `searchController.ts`.

### Database Schema

Logs are stored with the following structure:
- `message`: The log message content
- `logLevel`: Log level (info, error, etc.)
- `serviceName`: Name of the service that generated the log
- `timestamp`: When the log was created
- `metadata`: Additional log metadata (currently empty object)


## Environment Variables
We do have dotenv, however, for simplicity we hardcoded the local variables..
