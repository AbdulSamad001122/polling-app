# Pollify - Full-Stack Real-Time Polling Platform

Pollify is a robust full-stack web application that allows users to create, share, and manage real-time polls. Built specifically to fulfill all hackathon requirements, it features anonymous and authenticated voting, mandatory/optional questions, automatic poll expiry, and a rich real-time analytics dashboard powered by WebSockets.

## 🚀 Features (Hackathon Requirements Fulfilled)

- **Single Option Questions:** Allows users to choose one answer per question smoothly.
- **Anonymous & Authenticated Responses:** Creators can toggle whether users must be signed in (via Clerk) to vote, or if guests can participate.
- **Poll Expiry System:** Automatically closes polls when the configured expiry date is reached.
- **Mandatory vs. Optional Questions:** Comprehensive frontend and backend validation for required questions.
- **Deep Insights & Analytics Dashboard:** A powerful dashboard showing live leaderboards, summaries, option counts, and participant tracking.
- **Publish Results:** Creators can publish final results, making them publicly viewable via the original poll link.
- **Real-Time WebSockets:** Powered by `Socket.io` to provide instantaneous live response counting and leaderboard updates.
- **Monorepo Structure:** Both frontend (React) and backend (Express) maintained in a single GitHub repository.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Clerk (Authentication)
- Socket.io-client
- React Router DOM
- Axios

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io
- Clerk Express Middleware

## 📂 Project Structure

- `/frontend` - React application
- `/backend` - Node.js/Express API and WebSocket server

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Poll-App
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/poll_app
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `/frontend` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```
Start the frontend:
```bash
npm run dev
```

## 📝 License
MIT
