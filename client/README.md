# AI-Powered Industrial Knowledge Management System

A modern, AI-powered platform for managing industrial documents, featuring:

## Features
- 🔐 User Authentication (Login/Signup, JWT, Refresh Tokens, Password Reset)
- 📄 Document Management System (upload, list, view, delete, drag-and-drop)
- 🤖 AI Assistant (Gemini API, TXT/PDF text extraction)
- 📊 Analytics Dashboard (dynamic metrics, GROQ-powered document analysis with charts)
- 👥 Team Management
- 🌓 Dark/Light Mode Toggle
- 🖼️ Image Slider & Testimonials Marquee on Landing Page
- 🎨 Beautiful UI with Framer Motion animations, custom cursor, gradient backgrounds
- 📱 Responsive Design

## Tech Stack
- React 19
- Vite
- Tailwind CSS
- ShadCN UI
- Framer Motion
- React Router
- React Query (TanStack Query)
- Lucide Icons
- React Hook Form
- Recharts (Charts)
- Axios

## Getting Started

### Prerequisites
- Node.js (v18+)
- Backend API running (see server/README.md)

### Installation

1. Install dependencies:
```bash
cd client
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration (VITE_API_BASE_URL)
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

## Test Credentials
(Create a user via the signup page, backend supports local authentication)

## Project Structure
```
client/src/
├── assets/              # Static assets
├── components/
│   ├── common/         # Reusable components (ImageSlider, MouseGlow, ThemeToggle)
│   ├── landing/        # Landing page components
│   ├── layout/         # Layout components (AppLayout, PublicLayout, Footer)
│   ├── navigation/     # Navbar, Sidebar
│   └── ui/             # ShadCN UI components
├── constants/          # Constants
├── context/            # React Context (Auth, Theme, Notifications)
├── hooks/              # Custom hooks (useAuth, useAnalytics, useDocuments, etc.)
├── pages/              # Page components (all app pages)
├── routes/             # React Router config
├── services/api/       # API service layer
└── utils/              # Utility functions (getFileUrl, cn, etc.)
```

## Next Steps
- [ ] Implement RAG pipeline for better document search
- [ ] Add more AI features (semantic search, advanced QA)
- [ ] Deploy to Vercel

## License
MIT
