# Pollify

Pollify is a high-performance, full-stack polling platform designed for real-time engagement and deep data insights. It allows creators to build sophisticated polls with multiple questions, manage participant privacy, and monitor live results through a dynamic analytics dashboard.

## Core Capabilities

### Advanced Poll Creation
*   **Multi-Question Polls**: Support for multiple single-choice questions within a single poll instance.
*   **Flexible Validation**: Toggle mandatory or optional questions to ensure data quality.
*   **Automated Expiry**: Set specific dates and times for polls to close automatically.
*   **Privacy Controls**: Choose between public discovery and private link-only access.

### Participant Experience
*   **Authentication Modes**: Creators can require Clerk authentication for verified responses or allow guest voting.
*   **Anonymity Options**: Support for anonymous submissions where user identities are never linked to their votes.
*   **Seamless Voting**: A clean, responsive interface optimized for both desktop and mobile devices.

### Real-Time Insights & Sharing
*   **Live Analytics Dashboard**: Visualized data showing response trends, option counts, and participant distributions.
*   **Instant Updates**: Powered by Socket.io for real-time leaderboard updates without page refreshes.
*   **Instant Sharing**: Built-in QR code generation and link-sharing tools for rapid distribution.
*   **Community Feed**: A centralized discovery page to browse and search for public poll results.

## Technical Foundation

### Frontend
*   **Framework**: React 19 (Vite)
*   **Styling**: Tailwind CSS 4
*   **Authentication**: Clerk
*   **Real-Time**: Socket.io-client
*   **Icons & UI**: Lucide React, React Hot Toast

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Communication**: Socket.io for bi-directional real-time updates
*   **Security**: Helmet, Express Rate Limit, and Joi validation

## Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB installed and running on your machine.

### 2. Repository Setup
```bash
git clone <repository-url>
cd Poll-App
```

### 3. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```
Start the server:
```bash
npm run dev
```

### 4. Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```
Start the development server:
```bash
npm run dev
```

## Project Organization
The project follows a monorepo structure for simplified management:
*   `/frontend`: React application containing all UI components and client-side logic.
*   `/backend`: Node.js API server, database models, and WebSocket handlers.

## License
Distributed under the MIT License.
