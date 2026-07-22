# Industrial AI - Backend API

A production-ready backend API for the AI-powered industrial knowledge management system.

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication (access + refresh tokens, cookies)
- Helmet (Security Headers)
- Express Rate Limiting
- Logging with Winston
- Multer (File Uploads)
- Groq SDK (LLM for document analysis)
- pdf-parse-new (PDF text extraction)
- Google Gemini (AI Assistant Chat)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (locally or via MongoDB Atlas)
- Groq API Key (for document analysis)
- Google Gemini API Key (for AI Assistant Chat)

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration (MONGODB_URI, GROQ_API_KEY, GEMINI_API_KEY, etc.)
```

3. Start MongoDB (if running locally):
- Option 1: Use MongoDB Community Server
- Option 2: Use Docker:
```bash
docker run -d -p 27017:27017 --name industrial-ai-mongo mongo:latest
```
- Option 3: Use MongoDB Atlas (update MONGODB_URI in .env)

4. Start the development server:
```bash
npm run dev
```

5. Production:
```bash
npm run start
```

## Environment Variables

See `.env.example` for all available configuration options.

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication Endpoints
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout (protected)
- `POST /auth/refresh-token` - Refresh token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password
- `POST /auth/request-verification` - Request email verification (protected)
- `POST /auth/verify-email/:token` - Verify email
- `GET /auth/me` - Get current user (protected)
- `PUT /auth/me` - Update profile (protected)

### Documents Endpoints
- `GET /documents` - List all documents (protected)
- `GET /documents/:id` - Get single document (protected)
- `POST /documents` - Upload new document (protected, accepts FormData with 'document' file)
- `DELETE /documents/:id` - Delete document (protected, removes physical file too)

### Analytics Endpoints
- `GET /analytics/metrics` - Get dynamic metrics (protected)
- `POST /analytics/analyze-document` - Analyze PDF with GROQ (protected, accepts FormData with 'document' file)

### AI Assistant Endpoints
- `POST /ai/chat` - Chat with AI Assistant (protected, accepts documentId and prompt)

## Project Structure
```
server/
├── config/          # Configuration
├── database/        # DB connection
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── validators/      # Validations
├── utils/           # Utilities
├── constants/       # Constants
├── uploads/         # File uploads (created automatically)
├── logs/            # Log files (created automatically)
├── app.js
└── server.js
```

## License
MIT
