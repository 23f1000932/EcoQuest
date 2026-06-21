# 🌿 EcoQuest India

> **Gamifying Sustainability — One Eco Action at a Time**

[![GitHub stars](https://img.shields.io/github/stars/23f1000932/EcoQuest?style=flat-square&color=22c55e)](https://github.com/23f1000932/EcoQuest)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)

---

## 🎯 Chosen Vertical

**Individual Sustainability Tracking & Behavior-Change Gamification.**

EcoQuest India targets the _individual eco-action_ vertical — empowering everyday citizens to log, verify, and be rewarded for personal sustainable actions (planting trees, cycling, using public transport, segregating waste). The platform is designed as a behavior-change engine: by combining AI-powered photo verification with gamification mechanics (points, streaks, badges, leaderboards, redeemable rewards), it turns sporadic good intentions into consistent green habits. The focus is on India, where sustainability awareness is growing rapidly but tools for individual accountability remain limited.

---

## 🧠 Approach & Logic

The core workflow follows a **photo-upload → AI classification → confidence-gated approval → reward** pipeline. A user uploads a photo of their eco-action (e.g., a planted sapling, a metro ticket, a segregated waste bin). The image bytes are sent to Google Gemini 2.5 Flash Vision, which returns a structured JSON with the detected activity type, a confidence score (0–100), estimated CO₂ savings, and a one-sentence reason.

The confidence score drives a three-tier decision gate: **≥ 70% confidence** → auto-approved, points awarded instantly; **40–69% confidence** → queued for admin manual review; **< 40% confidence** → auto-rejected as unlikely to be a genuine eco-action. Before AI verification, a perceptual hash (pHash) of the image is computed and compared against the user's past uploads to detect duplicate or near-identical submissions (Hamming distance ≤ 10).

On approval, the system awards activity-specific points and carbon savings, updates the user's level (a 6-tier progression from Seedling to Sustainability Legend), checks for newly unlocked badges, and increments the user's streak if they uploaded on consecutive days (+5 bonus points for streaks). Points can be redeemed for tangible rewards (gift cards, eco merchandise, tree planting via partner NGOs).

---

## 📋 Assumptions Made

- **A single photo is sufficient evidence** of an eco-activity. The system does not require GPS coordinates, timestamps from EXIF, or multi-photo verification — it trusts Gemini Vision's classification with confidence gating and admin review as safeguards.
- **Users are in India.** Point values, carbon savings estimates, activity types (e.g., "Public Transport" reflecting Indian metro/bus systems), and reward catalog (₹ denominations) are calibrated for the Indian context.
- **SQLite for development, PostgreSQL for production.** The database layer uses `aiosqlite` locally and auto-switches to `asyncpg` when a `postgresql://` connection string is provided, with no code changes needed.
- **Carbon savings are estimates, not precise measurements.** The `CARBON_SAVINGS_MAP` uses reasonable per-action averages (e.g., 20 kg CO₂ per tree planted, 2.5 kg per public transport trip) rather than scientifically measured values.
- **Daily upload limit of 10 activities per user** to prevent spam and maintain platform integrity.
- **Supabase handles authentication.** The backend verifies Supabase-issued JWTs server-side and does not implement its own password storage or OAuth flows.

## 🎯 My Goal

India faces a massive awareness and action gap in sustainability. People *want* to be eco-friendly, but lack the motivation, accountability, and community to actually do it consistently.

**EcoQuest India** is my attempt to fix that.

The goal is simple: **make sustainable living addictive**. By turning everyday eco-actions — planting a tree, cycling to work, using public transport, segregating waste — into a gamified experience with real rewards, I want to inspire individuals to build lasting green habits, one upload at a time.

---

## 💡 My Vision

I envision EcoQuest as India's largest sustainability challenge platform — a place where:

- 🌱 **Anyone can participate** — students, professionals, families, NGOs
- 📸 **Proof matters** — photo uploads are verified by AI, not just self-reported
- 🏆 **Effort is rewarded** — points, badges, leaderboards, and real redeemable rewards
- 🤝 **Community drives change** — collective impact stats show what we've achieved *together*
- 🧠 **AI ensures integrity** — Gemini Vision verifies authenticity, preventing gaming the system

The vision is not just an app — it's a **movement toward a greener India**, powered by technology and community accountability.

---

## ✨ Features

### 🖼️ AI-Powered Activity Verification
Upload a photo of your eco-action. Google Gemini 2.5 Flash analyzes the image and:
- Identifies the activity type (Tree Plantation, Cycling, Community Cleanup, etc.)
- Returns a confidence score (0–100)
- Awards points and estimated CO₂ savings
- Flags low-confidence submissions for admin review

### 🛡️ Anti-Cheat System
- **Perceptual hashing** (pHash) detects duplicate/reused images
- Hamming distance threshold blocks near-identical submissions
- Daily upload limits prevent spam abuse
- API rate limiting via SlowAPI

### 🎮 Gamification Engine
- **Points** for every verified eco-action
- **Levels** that progress as you accumulate points
- **Streaks** — consecutive daily upload rewards
- **Badges** earned at milestone thresholds (Green Beginner → Sustainability Legend)

### 🏅 Leaderboard
- Real-time ranking of all users by total points
- See your position among the community

### 🎁 Rewards Store
Redeem your points for:
- Amazon Gift Cards
- Eco Tote Bags
- Sustainability Certificates (PDF)
- Plant a Tree (via partner NGO)
- Monthly Champion Badge (featured on homepage)

### 📊 Impact Dashboard
Track your personal and platform-wide environmental impact:
- Total carbon saved (kg CO₂)
- Trees planted
- Cycling trips
- Public transport uses
- Activity history with AI verification details

### 👑 Admin Panel
- Review and approve/reject pending submissions
- Manage rewards inventory
- View platform-wide statistics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite 8** | Lightning-fast build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **React Router v7** | Client-side routing |
| **Recharts** | Impact data visualizations |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon library |
| **React Hot Toast** | Notification toasts |
| **Canvas Confetti** | Celebration animations 🎉 |
| **Supabase JS** | Auth & Storage client |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python API framework |
| **SQLAlchemy 2 (async)** | ORM with async support |
| **SQLite + aiosqlite** | Database (dev) / swap PostgreSQL for prod |
| **Supabase** | Authentication (JWT) & image storage |
| **Google Gemini 2.5 Flash** | AI image verification via Vision API |
| **Pillow + imagehash** | Perceptual hashing for duplicate detection |
| **SlowAPI** | Rate limiting middleware |
| **Pydantic v2** | Request/response validation & settings |
| **python-jose** | JWT token validation |
| **httpx** | Async HTTP client for Gemini API calls |
| **Uvicorn** | ASGI server |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Supabase** | Auth, Storage (image CDN), real-time |
| **Docker + Docker Compose** | Containerized local development |
| **Vercel** *(planned)* | Frontend deployment |

---

## 🏗️ Architecture

```
EcoQuest/
├── frontend/                  # React + Vite SPA
│   └── src/
│       ├── pages/             # Landing, Dashboard, Upload, Leaderboard,
│       │                      #   Impact, Profile, Rewards, Admin
│       ├── components/        # Navbar, AuthModal, AIVerificationModal,
│       │                      #   LeaderboardRow, ...
│       ├── api/               # Axios API layer
│       ├── context/           # Auth context (Supabase session)
│       ├── hooks/             # Custom React hooks
│       └── types/             # TypeScript interfaces
│
└── backend/                   # FastAPI Python API
    ├── main.py                # App entrypoint, CORS, startup seeding
    ├── models.py              # SQLAlchemy ORM models
    ├── schemas.py             # Pydantic request/response schemas
    ├── database.py            # Async DB engine & session
    ├── auth.py                # JWT verification middleware
    ├── ai_verifier.py         # Gemini Vision integration
    ├── anti_cheat.py          # Perceptual hash duplicate detection
    ├── config.py              # Pydantic settings from .env
    └── routers/               # API route handlers
        ├── auth.py            # /api/auth
        ├── users.py           # /api/users
        ├── activities.py      # /api/activities  ← core upload flow
        ├── leaderboard.py     # /api/leaderboard
        ├── badges.py          # /api/badges
        ├── rewards.py         # /api/rewards
        ├── impact.py          # /api/impact
        └── admin.py           # /api/admin
```

---

## 🌱 Activity Types & Points

| Activity | Points | CO₂ Saved (kg) |
|---|---|---|
| 🌳 Tree Plantation | 100 | 20.0 |
| 🧹 Community Cleanup | 80 | 5.0 |
| 🚌 Public Transport | 30 | 2.5 |
| 🚴 Cycling | 25 | 1.5 |
| ♻️ Waste Segregation | 20 | 1.0 |
| 💧 Reusable Bottle | 10 | 0.5 |
| 🛍️ Cloth Bag | 10 | 0.3 |
| 🌞 Other Eco Action | 15 | 1.0 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.11+
- **Supabase** account (free tier works)
- **Google Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com))

---

### 1. Clone the Repository

```bash
git clone https://github.com/23f1000932/EcoQuest.git
cd EcoQuest
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# Run the server
python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase and API URL

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

### 4. Docker (Optional)

```bash
# From project root
docker-compose up --build
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# Google Gemini AI
GEMINI_API_KEY=AIza...

# App
DATABASE_URL=sqlite+aiosqlite:///./ecoquest.db
SECRET_KEY=change-me-to-a-random-32-char-string-please
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
MAX_DAILY_UPLOADS=10
AI_CONFIDENCE_THRESHOLD=70
ADMIN_EMAIL=admin@ecoquest.in
```

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Register & sync user |
| `POST` | `/api/activities/upload` | Upload eco-action photo |
| `GET` | `/api/activities/my` | Get my activity history |
| `GET` | `/api/leaderboard` | Global leaderboard |
| `GET` | `/api/badges` | All available badges |
| `GET` | `/api/rewards` | Available rewards |
| `POST` | `/api/rewards/{id}/redeem` | Redeem a reward |
| `GET` | `/api/impact/me` | Personal impact stats |
| `GET` | `/api/impact/platform` | Platform-wide stats |
| `GET` | `/api/users/me` | Current user profile |
| `GET` | `/api/admin/pending` | Pending submissions (admin) |
| `POST` | `/api/admin/activities/{id}/approve` | Approve submission (admin) |
| `POST` | `/api/admin/activities/{id}/reject` | Reject submission (admin) |

Full interactive documentation available at `/docs` (Swagger UI) when running locally.

---

## 🛡️ How AI Verification Works

```
User uploads photo
       ↓
Image bytes sent to Gemini 2.5 Flash Vision API
       ↓
AI returns: activity type, confidence (0-100), reason
       ↓
confidence ≥ 70?  →  Auto-approved → Points awarded instantly
confidence < 70?  →  Queued for admin manual review
confidence < 40?  →  Likely rejected (not eco-related)
       ↓
pHash computed → checked against all user's past uploads
Duplicate detected? → Rejected with "duplicate image" message
```

---

## 🔐 Security

- **JWT-based auth** — all protected routes verify Supabase-issued tokens server-side
- **Rate limiting** — SlowAPI limits upload frequency per IP
- **Daily upload cap** — configurable `MAX_DAILY_UPLOADS` per user
- **Image dedup** — perceptual hashing prevents reuse of same/similar images
- **AI confidence gating** — low-confidence images go to human review before points

---

## 🗺️ Roadmap

- [ ] PostgreSQL migration for production
- [ ] Push notifications for badge unlocks
- [ ] Team/organization challenges
- [ ] NGO partner integrations
- [ ] Carbon offset certificates (blockchain-backed)
- [ ] Mobile app (React Native)
- [ ] Multilingual support (Hindi, Tamil, Bengali)
- [ ] City-level leaderboards

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👤 Author

**Ayan** — [@23f1000932](https://github.com/23f1000932)

Built with ❤️ for a greener India 🇮🇳

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>🌍 Every eco-action counts. Start your quest today.</strong>
</div>