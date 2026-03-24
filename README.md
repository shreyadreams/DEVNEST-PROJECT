# 🦉 DevNest — Developer Analytics & Portfolio Platform

> Built for placement-ready developers | MERN Stack + Claude AI

---

## 📁 Project Structure

```
devnest/
├── backend/                    ← Node.js + Express API
│   ├── server.js               ← Entry point, DB connection, route mounting
│   ├── .env.example            ← Copy to .env and fill your keys
│   ├── config/
│   │   └── db.js               ← MongoDB connection (optional standalone)
│   ├── models/
│   │   └── User.model.js       ← MongoDB schema + bcrypt hooks
│   ├── controllers/
│   │   └── auth.controller.js  ← register, login, getMe logic
│   ├── routes/
│   │   ├── auth.routes.js      ✅ DONE
│   │   ├── user.routes.js      ⏳ Step 2
│   │   ├── dsa.routes.js       ⏳ Step 4
│   │   ├── github.routes.js    ⏳ Step 3
│   │   └── ai.routes.js        ⏳ Step 7
│   ├── middleware/
│   │   └── auth.middleware.js  ← JWT protect() middleware
│   └── utils/
│       └── generateToken.js    ← JWT creation helper
│
└── frontend/                   ← React.js app
    ├── package.json
    └── src/
        ├── context/
        │   └── AuthContext.js  ← Global auth state (currentUser)
        ├── services/
        │   └── api.js          ← All Axios API calls in one place
        ├── components/
        │   ├── auth/           ⏳ LoginForm, RegisterForm
        │   └── dashboard/      ⏳ DashboardLayout, StatsCard
        └── pages/              ⏳ Home, Login, Register, Dashboard
```

---

## 🚀 How to Run

### Backend
```bash
cd backend
cp .env.example .env      # Fill in your MongoDB URI and JWT secret
npm install
npm run dev               # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start                 # Starts on http://localhost:3000
```

---

## 🔐 Auth Flow (How it works)

```
User fills Register form
        ↓
POST /api/auth/register
        ↓
Controller: Check duplicate → Create user → Hash password (bcrypt)
        ↓
Return: JWT token + user data
        ↓
Frontend: Save token to localStorage → AuthContext updates currentUser
        ↓
Every future request: token sent in Authorization header
        ↓
protect() middleware: verify token → attach req.user → allow access
```

---

## 📌 Build Steps

| Step | Feature              | Status |
|------|----------------------|--------|
| 1    | Folder Structure     | ✅ Done |
| 2    | Auth (JWT)           | ✅ Done |
| 3    | GitHub API           | ⏳ Next |
| 4    | DSA Tracker          | ⏳      |
| 5    | Frontend Landing     | ⏳      |
| 6    | Frontend Dashboard   | ⏳      |
| 7    | AI Features          | ⏳      |
| 8    | Deploy               | ⏳      |
