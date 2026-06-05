# TradeX AI - AI-Powered Trading Simulator

A beginner-friendly, AI-powered demo trading simulator platform. Practice trading with \$999,999,999 virtual dollars.

## Features

- **Demo Trading** - Buy/Sell crypto, stocks, forex, and commodities with virtual money
- **AI Assistant** - Get market analysis, trading advice, and portfolio recommendations
- **Real-time Charts** - Candlestick, line, and area charts with technical indicators
- **Portfolio Management** - Track holdings, P&L, ROI, and trading history
- **Reward System** - Daily login rewards, XP levels, achievements
- **Authentication** - Email/Google login, OTP verification, forgot password
- **Admin Dashboard** - User management, analytics, news, support tickets
- **WebSocket** - Real-time price updates

## Tech Stack

- **Frontend**: Flutter (Mobile + Web)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io (WebSocket)
- **Auth**: JWT + bcrypt

## Project Structure

```
tradex-ai/
├── backend/                  # Node.js Backend
│   ├── config/               # DB, JWT, constants
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, validation
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── services/             # Trading engine, AI, rewards
│   ├── websocket/            # Socket.io handler
│   └── server.js             # Entry point
├── mobile/                   # Flutter App
│   └── lib/
│       ├── config/           # Theme, constants
│       ├── models/           # Data models
│       ├── providers/        # State management
│       ├── screens/          # UI screens
│       │   ├── auth/         # Login, Register, Forgot
│       │   ├── dashboard/    # Main dashboard
│       │   ├── trading/      # Order placement
│       │   ├── portfolio/    # Holdings
│       │   ├── ai/           # AI chat & analysis
│       │   ├── rewards/      # Rewards & XP
│       │   └── home/         # Bottom nav wrapper
│       └── widgets/          # Reusable widgets
└── README.md
```

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI
npm start
```

### Flutter App

```bash
cd mobile
flutter pub get
flutter run
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Send OTP
- `POST /api/auth/reset-password` - Reset password

### Trading
- `GET /api/trading/dashboard` - Dashboard data
- `GET /api/trading/assets` - Available assets
- `POST /api/trading/orders` - Place order
- `GET /api/trading/trades` - Trade history
- `GET /api/trading/portfolio` - Portfolio

### AI
- `GET /api/ai/market-analysis` - Market analysis
- `GET /api/ai/asset-analysis/:symbol` - Asset analysis
- `POST /api/ai/chat` - Chat with AI
- `GET /api/ai/recommendations` - AI recommendations

### Rewards
- `GET /api/rewards/status` - Reward status
- `POST /api/rewards/daily-claim` - Claim daily reward
- `GET /api/rewards/achievements` - Achievements
- `GET /api/rewards/level` - XP & level info

### Admin
- `GET /api/admin/dashboard` - Admin stats
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics` - Platform analytics

## License

MIT
