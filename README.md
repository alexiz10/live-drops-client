# LiveDrops - Frontend Client

LiveDrops is a real-time auction and bidding platform. This repository contains the frontend client, built to handle live WebSocket streams, strict form variables, and secure session management.

## Tech Stack

* Framework: React + Vite
* Language: TypeScript
* Routing: TanStack Router (File-based)
* Styling: Tailwind CSS
* Forms & Validation: React Hook Form + Zod
* Data Visualization: Recharts
* Authentication: SuperTokens (Web JS SDK)
* Deployment: Vercel

## Key Features

* Real-Time Bidding Interface: Connects to the backend via WebSockets to render live bid updates and auction timers without client-side polling.
* Enterprise Authentication: Integrated with SuperTokens for secure, HTTP-only cookie session management, fully compatible with mobile ITP (Intelligent Tracking Prevention) restrictions.
* Strict Type Safety: End-to-end type safety. Zod securely coerces and validates form inputs before hitting the React Hook Form resolvers, ensuring no implicit 'any' types compromise the build.
* Production-Grade Routing: Utilizes TanStack Router for type-safe navigation, paired with custom Vercel rewrite rules to cleanly handle Single Page Application (SPA) deep-linking.

## Local Development Setup

### Prerequisites
* Node.js (v18+)
* npm

### Installation & Execution

1. Install dependencies:
```bash
npm install
```

2. Environment Configuration

Create a `.env` file in the root directory based on `.env.example` and populate it with your local API and WebSocket URLs.

3. Start the development server:
```bash
npm run dev
```

4. Code Formatting & Linting:
```bash
npm run format
npm run lint:fix
```
