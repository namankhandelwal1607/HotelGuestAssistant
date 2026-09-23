# 🏨 Hotel Guest Assistant — The Grand Azure Resort & Spa

A full-stack, AI-powered guest assistant web application built with **Next.js (App Router)**, **Tailwind CSS**, **Node.js + Express**, **TypeScript**, and **Groq LLM** (`llama-3.3-70b-versatile` with native tool calling).

The assistant allows prospective and booked hotel guests to ask questions about amenities, check-in policies, room suitability, and check real-time room availability through a deterministic tool-use pipeline.

---

## 🌟 Key Features

- **Strict Knowledge Base Grounding**: Answers property details, policies, breakfast, and amenities strictly from `backend/data/hotel-data.json`. Explicitly trained and prompted to refuse out-of-scope questions rather than invent facts.
- **Deterministic Room Availability Engine**: Room availability and pricing are **never** hallucinated by the LLM. The AI extracts structured parameters (`checkIn`, `checkOut`, `adults`) and triggers an internal deterministic `checkAvailability()` service.
- **Smart Missing Field Detection**: When guests express intent to check availability but omit required fields (e.g., dates or guest count), the backend returns structured `missingFields` and the frontend renders an intuitive **inline stay date & guest picker form** directly in the chat message stream.
- **Rich Availability Cards**: Room search results render as clean, interactive cards displaying nightly rates, computed total stay cost, bed configurations, maximum occupancy, amenity tags, and availability status.
- **Context-Aware Conversation Memory**: Maintains conversational continuity across turns (e.g. asking *"What time is check-in?"* followed by *"And what about breakfast?"*) via an in-memory sliding window keyed by `conversationId`.
- **Fault-Tolerant & Resilient**: Gracefully handles upstream LLM failures, invalid date inputs, and network timeouts with informative user-facing alerts and single-click retry actions. Zero server crashes.
- **100% Test-Covered**: Includes a comprehensive Jest test suite covering all 10 assignment scenarios plus edge cases.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript, Zod, UUID, CORS, Dotenv
- **AI / LLM Layer**: Groq API SDK (`groq-sdk`) using `llama-3.3-70b-versatile` with native function/tool calling.
  - *Note*: An offline, deterministic grounded mock mode is built-in so all automated tests and UI flows run cleanly even without an API key.
- **Knowledge Base**: Structured local JSON (`backend/data/hotel-data.json`) abstracted via repository pattern (easily swappable for PostgreSQL/MongoDB).
- **Testing**: Jest, Supertest, Ts-Jest (covering 15 tests across all 10 core scenarios).

---

## 📁 Repository Structure

```text
hotel-guest-assistant/
├── backend/
│   ├── data/
│   │   └── hotel-data.json         # Authoritative hotel knowledge base
│   ├── src/
│   │   ├── data/
│   │   │   └── hotelDataRepository.ts # Clean repository layer
│   │   ├── middleware/
│   │   │   └── errorHandler.ts     # Consistent API error handler
│   │   ├── routes/
│   │   │   ├── availability.ts     # POST /api/availability
│   │   │   ├── chat.ts             # POST /api/chat
│   │   │   └── health.ts           # GET /api/health
│   │   ├── services/
│   │   │   ├── aiService.ts        # Groq tool calling + deterministic fallback
│   │   │   ├── availabilityService.ts # Deterministic room booking & pricing logic
│   │   │   └── conversationService.ts # In-memory conversation context memory
│   │   ├── types/
│   │   │   └── index.ts            # Shared TypeScript contracts
│   │   ├── utils/
│   │   │   └── logger.ts           # ISO-timestamped console logger
│   │   ├── app.ts                  # Express application configuration
│   │   └── index.ts                # Server entry point
│   ├── tests/
│   │   └── chat.test.ts            # Jest tests covering 10 required scenarios
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css         # Tailwind styles & custom scrollbars
│   │   │   ├── layout.tsx          # Root metadata and font configuration
│   │   │   └── page.tsx            # Concierge home page
│   │   ├── components/
│   │   │   ├── AvailabilityCard.tsx # Room card with pricing & reserve CTA
│   │   │   ├── AvailabilityForm.tsx # Inline date & guest picker form
│   │   │   ├── ChatInterface.tsx   # Core chat controller & message stream
│   │   │   ├── MessageBubble.tsx   # Avatar & rich widget bubble renderer
│   │   │   ├── MessageList.tsx     # Auto-scrolling list with typing state
│   │   │   ├── Navbar.tsx          # Hotel branding & status pill
│   │   │   └── QuickPrompts.tsx    # Clickable FAQ starter chips
│   │   ├── services/
│   │   │   └── api.ts              # Typed backend HTTP client with timeout/retry
│   │   └── types/
│   │       └── index.ts            # Frontend TypeScript models
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── ARCHITECTURE.md                 # System diagrams, tool flows, and data boundaries
├── PRODUCT_NOTES.md                # In-depth answers to all 9 evaluation questions
├── API_EXAMPLES.md                 # Curl examples for every endpoint & status
├── EVALUATION.md                   # 12 QA scenarios with observed inputs & outputs
├── package.json                    # Root monorepo workspace scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x
- **npm**: v9.x or v10.x

### 1. Installation

From the repository root:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install in each directory individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### 2. Environment Configuration

#### Backend (`backend/.env`)
Copy the template in `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Contents of `backend/.env`:
```env
PORT=4000
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
CORS_ORIGIN=http://localhost:3000
```
> [!TIP]
> **No API Key?** If `GROQ_API_KEY` is not provided, the backend automatically runs in **deterministic grounded mode**. All FAQ questions, room recommendations, missing field forms, and availability checks will function smoothly!

#### Frontend (`frontend/.env.local`)
Copy the template in `frontend/.env.example` to `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```
Contents:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

### 3. Running the Application

You can launch both the backend and frontend concurrently from the root:
```bash
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Backend (runs on http://localhost:4000)
npm run dev:backend

# Terminal 2: Frontend (runs on http://localhost:3000)
npm run dev:frontend
```

Open your browser at [http://localhost:3000](http://localhost:3000) to interact with the AI Concierge!

---

### 4. Running Automated Tests

Run the complete backend Jest test suite:
```bash
npm test
```
Or directly inside the backend folder:
```bash
cd backend && npm test
```

#### Test Suite Coverage (15 passing tests):
1. `GET /api/health` — Service metadata and health status.
2. `Scenario 1` — FAQ policy question (check-in & check-out times).
3. `Scenario 2` — Amenity question (swimming pool details).
4. `Scenario 3` — Room suitability recommendation (room for 3 guests).
5. `Scenario 4` — Availability request with all fields present (triggers tool & returns structured room cards).
6. `Scenario 5` — Availability request with missing fields (requests guest count without hallucinating).
7. `Scenario 6` — Ambiguous question ("Is it good for kids?") -> grounded response.
8. `Scenario 7` — Out-of-scope / unanswerable question ("Weather in Paris") -> graceful fallback refusal.
9. `Scenario 8` — Follow-up pronoun reference ("And what about breakfast?") -> context preserved.
10. `Scenario 9` — Simulated upstream LLM failure -> graceful fallback without server crash.
11. `Scenario 10` — End-to-end multi-turn conversation flow across 3 consecutive turns.
12. `POST /api/availability` — Direct endpoint happy path, date validation, and invalid capacity checks.

---

## 🤖 AI Tools Used During Development

In accordance with assignment transparency guidelines, the following AI tools and models were used during the engineering of this project:
- **Google Antigravity**: Primary autonomous agentic coding assistant for scaffolding the monorepo, authoring TypeScript services and React components, crafting test suites, and creating architectural documentation.
- **Anthropic Claude 3.5 Sonnet / Gemini 3.8 Flash**: High-reasoning foundation models utilized during system design and planning.
- **Groq API (`llama-3.3-70b-versatile`)**: Ultra-low-latency runtime LLM powering natural language understanding and native tool/function calling for availability extraction.

---

## 📚 Further Documentation

- **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**: Full architectural diagram, tool execution pipeline, and data isolation boundaries.
- **[`PRODUCT_NOTES.md`](./PRODUCT_NOTES.md)**: Comprehensive answers to all 9 evaluation questions (UX rationale, hallucination prevention, metrics, and production roadmap).
- **[`API_EXAMPLES.md`](./API_EXAMPLES.md)**: Ready-to-use `curl` examples for every endpoint, status code, and scenario.
- **[`EVALUATION.md`](./EVALUATION.md)**: Detailed QA log covering 12 test scenarios with observed inputs and outputs.
