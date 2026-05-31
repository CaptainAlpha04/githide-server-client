# githide — Server & Dashboard

> Self-hosted backend and web dashboard for [githide](https://github.com/CaptainAlpha04/githide) — the encrypted `.env` sharing tool.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/CaptainAlpha04/githide-server-client)

---

## What's in here

```
githide-server-client/
├── server/   Express.js API — stores encrypted file blobs, Firebase auth
└── web/      Next.js dashboard — manage repositories and collaborators
```

---

## One-Click Deploy

### Server → Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/CaptainAlpha04/githide-server-client)

### Web Dashboard → Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CaptainAlpha04/githide-server-client&root=web)

---

## Manual Setup

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A [Firebase](https://console.firebase.google.com) project with Email/Password auth and Firestore enabled

### Server

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev            # development
npm start              # production
```

**Required env vars (`server/.env`):**

```env
AUTH_TOKEN=<random secret — openssl rand -hex 32>
FIREBASE_SERVICE_ACCOUNT_KEY=<service account JSON as one line>
PORT=8000
ALLOWED_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Web Dashboard

```bash
cd web
npm install
cp .env.example .env.local   # fill in your Firebase web config
npm run dev                   # http://localhost:3000
```

**Required env vars (`web/.env.local`):**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Docker (Server)

```bash
cd server
docker build -t githide-server .
docker run -p 8000:8000 --env-file .env githide-server
```

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. **Authentication** → **Sign-in method** → Enable **Email/Password**
3. **Firestore Database** → **Create database** → Production mode
4. **Project Settings** → **Service Accounts** → **Generate new private key** (for server)
5. **Project Settings** → **General** → **Web app** → copy config (for web dashboard)

**Firestore security rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /repositories/{repoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## API Reference

All endpoints require `Authorization: Bearer <firebase-id-token>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/auth/me` | Verify token, get current user |
| `GET` | `/api/v1/files` | List uploaded encrypted files |
| `POST` | `/api/v1/files/:name` | Upload encrypted file |
| `GET` | `/api/v1/files/:name` | Download encrypted file |
| `GET` | `/api/v1/repositories` | List repositories |
| `POST` | `/api/v1/repositories` | Create repository |
| `GET` | `/api/v1/repositories/:id` | Get repository |
| `PATCH` | `/api/v1/repositories/:id` | Update repository |
| `DELETE` | `/api/v1/repositories/:id` | Delete repository |
| `GET` | `/api/v1/repositories/:id/collaborators` | List collaborators |
| `POST` | `/api/v1/repositories/:id/collaborators` | Add collaborator |
| `DELETE` | `/api/v1/repositories/:id/collaborators/:email` | Remove collaborator |

---

## CLI

The CLI that talks to this server lives at:
**[github.com/CaptainAlpha04/githide](https://github.com/CaptainAlpha04/githide)**

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome.

---

## License

[MIT](LICENSE)
