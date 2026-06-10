# Patch — Discount Tire IT Support Chatbot

Patch is a self-service IT support chatbot for Discount Tire associates. It guides users through structured troubleshooting workflows using a local Knowledge Base, persists all sessions as incidents in MongoDB, and escalates or resolves tickets automatically based on LLM analysis.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS v4
- **Database**: MongoDB via Mongoose
- **Auth**: iron-session (cookie-based, encrypted)
- **LLM**: Ollama (`gemma4:31b-cloud`)
- **Language**: TypeScript

## Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Ollama running with `gemma4:31b-cloud` model

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

```
MONGODB_URI=mongodb://localhost:27017/patch_db
SESSION_SECRET=your-32-character-minimum-secret-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:31b-cloud
```

### 3. Knowledge Base

Place Markdown troubleshooting guides in `knowledge_base/workflows/`:

```
knowledge_base/
  workflows/
    vdi.md          # VDI troubleshooting workflow
  images/
    img_001.png     # Images referenced in workflows
```

The system auto-detects `.md` files — no code changes needed to add new categories.

### 4. Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Create an account at `/signup`, then sign in at `/login`.

## Features

- **Authentication**: Signup/login with bcrypt-hashed passwords, cookie sessions
- **Landing Page**: Centered hero with VDI category tile and KB status badge
- **Chat Interface**: Full conversation with markdown rendering and inline images
- **Dynamic Controls**: Button chips (2-4 options), select list (5+), structured form cards
- **Incident Persistence**: Every session stored in MongoDB `Patch Transactions` collection
- **Escalation & Resolution**: Automatic status transitions with summary cards and feedback
- **Incident History**: List and detail pages with conversation replay and outcome details
- **Resume Chat**: Session-storage based resume flow for Open incidents

## Project Structure

```
app/
  page.tsx              # Main page (landing + active chat)
  login/page.tsx        # Login
  signup/page.tsx       # Signup
  incidents/page.tsx    # Incident list
  incidents/[id]/page.tsx  # Incident detail
  api/                  # API routes
    auth/               # Login, signup, logout, me
    chat/               # Main conversation endpoint
    incidents/          # CRUD + feedback
    kb/                 # KB status check
    images/             # Serve KB images
components/             # All UI components
lib/                    # Server utilities (mongodb, session, llm, kb, etc.)
proxy.ts               # Auth protection proxy
```
