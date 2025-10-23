# 📰 NewsFlow v2

> Multi-platform news aggregation application with AI-powered personalization

A modern news platform built with **React (Web)**, **React Native (Mobile)**, **Node.js/Express (Backend)**, and **PostgreSQL (Database)**, all containerized with **Docker**.

## 🎯 Project Overview

NewsFlow v2 is designed to replicate and enhance the functionality of the original news-flow project, with a focus on:

- **Local Development**: Docker-first approach for consistent development environment
- **Production Ready**: AWS deployment architecture (ECS + RDS)
- **Multi-platform**: Web and Mobile applications sharing the same backend
- **Modern Stack**: Latest technologies and best practices

## 🏗️ Architecture

```
newsflow-v2/
├── apps/
│   ├── web/              # React + Vite web application
│   └── mobile/           # React Native mobile app
├── services/
│   └── backend/          # Node.js/Express API server
├── packages/             # Shared code (future)
└── docker-compose.yml    # Local development environment
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Docker** & **Docker Compose**
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd newsflow-v2

# 2. Copy environment variables
cp .env.example .env

# 3. Start all services with Docker
npm run dev:build

# This will start:
# - PostgreSQL database (port 5432)
# - Backend API (port 3000)
# - Web frontend (port 5173)
```

### Access the Application

- **Web App**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

### Seed Database with Demo Data

```bash
# Run this after services are up
docker exec -it newsflow-backend npm run seed
```

## 📦 Tech Stack

### Frontend (Web)
- **React 19.1.0** - UI library (⚠️ 版本固定，不可升级)
- **Vite** - Build tool and dev server
- **Modern CSS** - Responsive design

### Frontend (Mobile)
- **React Native 0.81.4** - Mobile framework (⚠️ 版本固定)
- **React 19.1.0** - 必须与 react-native-renderer 版本匹配
- **Expo 54** - Development platform
- **React Navigation 6** - 页面导航
- **React Native Gesture Handler** - Swipe interactions
- **React Native Reanimated** - Smooth animations

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **PostgreSQL 16** - Database with full-text search
- **JWT** - Authentication (future)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD (future)

## 🛠️ Development

### Run Services Individually

```bash
# Backend only
npm run backend

# Web only
npm run web

# Mobile only
npm run mobile
```

### Database Management

```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Connect to PostgreSQL
docker exec -it newsflow-postgres psql -U newsflow -d newsflow
```

### Docker Commands

```bash
# Start services
npm run dev

# Rebuild and start
npm run dev:build

# Stop services
npm run dev:down

# Clean up (removes volumes)
npm run dev:clean

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f web
```

## 📱 Mobile Development

The mobile app requires additional setup:

```bash
cd apps/mobile

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS (requires macOS + Xcode)
npm run ios

# Run on Android (requires Android Studio)
npm run android
```

**Quick Option**: Use **Expo Go** app on your phone to scan the QR code.

## 🔌 API Endpoints

### News

- `GET /api/news` - Fetch news articles
  - Query params: `limit`, `offset`, `category`, `source`, `search`
- `GET /api/news/:id` - Get single article
- `POST /api/news/search` - Full-text search
  - Body: `{ "query": "search term" }`

### User

- `POST /api/user/activity` - Track user activity
  - Body: `{ "userId", "articleId", "action", "metadata" }`
- `GET /api/user/:userId/preferences` - Get user preferences

### Auth

- `POST /api/auth/register` - Register user (demo)
  - Body: `{ "email", "username" }`
- `GET /api/auth/user/:email` - Get user by email

## 🗄️ Database Schema

### Tables

- **users** - User accounts and profiles
- **articles** - News articles with full-text search
- **user_preferences** - Personalization data
- **user_activity** - User interactions (views, likes, swipes)
- **seen_articles** - Track read articles

### Full-Text Search

PostgreSQL's built-in full-text search is configured on the `articles` table:

```sql
SELECT * FROM articles 
WHERE search_vector @@ plainto_tsquery('english', 'your search term')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'your search term')) DESC;
```

## 🚢 Deployment

### Development (Current)

All services run in Docker containers on your local machine.

### Production (AWS - Recommended)

```
┌─────────────────────────────────────────┐
│   CloudFront + S3 (Web Static Files)    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Application Load Balancer             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   ECS Fargate (Backend Docker)          │
│   - Auto Scaling                        │
│   - Health Checks                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   RDS PostgreSQL (Multi-AZ)             │
└─────────────────────────────────────────┘
```

### Alternative Platforms

- **Vercel** (Web) + **Railway** (Backend + DB)
- **Netlify** (Web) + **Render** (Backend + DB)
- **GCP Cloud Run** + **Cloud SQL**

## 🔐 Environment Variables

See `.env.example` for all available configuration options.

**Important**: Never commit `.env` file to version control!

## 🧪 Testing

```bash
# Backend tests (future)
npm --prefix services/backend test

# Web tests (future)
npm --prefix apps/web test

# E2E tests (future)
npm run test:e2e
```

## 📝 Features Roadmap

### ✅ Completed (MVP)

- [x] Docker development environment
- [x] PostgreSQL database with full-text search
- [x] Express REST API
- [x] React web interface
- [x] News listing and search
- [x] Database seeding

### 🚧 In Progress

- [ ] Mobile app (React Native)
- [ ] User authentication (OAuth)
- [ ] Swipe interface for mobile
- [ ] Personalization algorithm

### 📋 Planned

- [ ] RSS news fetching
- [ ] OpenAI integration for summaries
- [ ] Push notifications
- [ ] In-app browser
- [ ] User analytics
- [ ] AWS deployment scripts
- [ ] CI/CD pipeline

## 🤝 Contributing

This project is designed for easy team collaboration:

1. **Clone the repo**
2. **Run `npm run dev:build`** - Everything starts automatically
3. **Make changes** - Hot reload works for all services
4. **Test locally** - All services run in Docker
5. **Commit and push**

## 📚 Documentation

- [Backend API Documentation](./services/backend/README.md)
- [Web App Documentation](./apps/web/README.md)
- [Mobile App Documentation](./apps/mobile/README.md)
- [Database Schema](./services/backend/database/README.md)

## 🐛 Troubleshooting

### Docker Issues

```bash
# Reset everything
npm run dev:clean
docker system prune -a
npm run dev:build
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # Backend
lsof -i :5173  # Web
lsof -i :5432  # PostgreSQL

# Kill the process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

## 📄 License

MIT

## 👥 Team

Built for multi-platform news aggregation with scalability in mind.

---

**Happy Coding! 🎉**

For questions or issues, please check the documentation or create an issue in the repository.
