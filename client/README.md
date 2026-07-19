# AI-Powered Industrial Knowledge Management System

A modern, AI-powered platform for managing industrial documents, featuring:

## Features
- 🔐 User Authentication (Login/Signup)
- 📄 Document Management System
- 🤖 AI Summary & Chat (Mock Implementation)
- 📊 Analytics Dashboard
- 👥 Team Management
- 🌓 Dark/Light Mode Toggle
- 🖼️ Image Slider on Landing Page
- 🎨 Beautiful UI with Framer Motion animations
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

## Getting Started

1. Install dependencies:
```bash
cd client
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to http://localhost:5173

## Test Credentials
- Email: alex.morgan@industrial.ai
- Password: password123

## Project Structure
```
client/src/
├── assets/              # Static assets
├── components/
│   ├── common/         # Reusable components
│   ├── layout/         # Layout components
│   └── ui/             # ShadCN UI components
├── constants/          # Mock data and constants
├── context/            # React Context (Auth, Theme, Notifications)
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
└── utils/              # Utility functions
```

## Next Steps
- [ ] Implement backend API with Node.js/Express
- [ ] Connect to MongoDB
- [ ] Add real authentication with JWT
- [ ] Implement file upload functionality
- [ ] Add real AI features with OpenAI API
- [ ] Deploy to production

## License
MIT
