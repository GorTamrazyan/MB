# Tina Marketplace — Ընկերությունների ծառայությունների հարթակ

B2B/B2C electronic marketplace for company services.

## Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn/UI, Zustand, TanStack Query
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Auth**: JWT (Access + Refresh tokens)

## Quick Start

### 1. Prerequisites

```bash
brew install node
brew install docker
```

### 2. Clone and install

```bash
cd /Users/gortamrazyan/Desktop/Tina
npm install
```

### 3. Start infrastructure

```bash
docker-compose up -d
```

PostgreSQL → localhost:5432
Redis → localhost:6379
pgAdmin → localhost:5050

### 4. Backend setup

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your secrets
npm run generate          # Generate Prisma client
npm run migrate           # Run migrations
npm run seed              # Seed demo data
npm run dev               # Start on port 4000
```

### 5. Frontend setup

```bash
cd apps/frontend
cp .env.local.example .env.local
npm run dev               # Start on port 3000
```

### 6. Open

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1
- pgAdmin: http://localhost:5050

## Demo Accounts (after seed)

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| Admin   | admin@tina.com         | Admin123456!  |
| Company | company@example.com    | Company123!   |
| Client  | client@example.com     | Client123!    |

## API Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/categories
GET    /api/v1/services?q=&categoryId=&minPrice=&maxPrice=&sortBy=&page=
GET    /api/v1/services/:slug
POST   /api/v1/services          (COMPANY)
PUT    /api/v1/services/:id      (COMPANY)
DELETE /api/v1/services/:id      (COMPANY)

GET    /api/v1/companies
GET    /api/v1/companies/:id
GET    /api/v1/companies/me      (COMPANY)
POST   /api/v1/companies         (COMPANY)
PUT    /api/v1/companies/:id     (COMPANY)

GET    /api/v1/packages/:id
POST   /api/v1/packages          (COMPANY)

GET    /api/v1/cart              (AUTH)
POST   /api/v1/cart/items        (AUTH)
PUT    /api/v1/cart/items/:id    (AUTH)
DELETE /api/v1/cart/items/:id    (AUTH)
POST   /api/v1/cart/checkout     (AUTH)

GET    /api/v1/orders            (AUTH)
GET    /api/v1/orders/:id        (AUTH)
GET    /api/v1/orders/company    (COMPANY)
PUT    /api/v1/orders/:id/status (COMPANY)

POST   /api/v1/reviews           (AUTH)
GET    /api/v1/reviews/company/:id

GET    /api/v1/notifications/stream  (AUTH SSE)
GET    /api/v1/notifications         (AUTH)
PUT    /api/v1/notifications/:id/read

GET    /api/v1/admin/stats       (ADMIN)
GET    /api/v1/admin/users       (ADMIN)
GET    /api/v1/admin/companies   (ADMIN)
GET    /api/v1/admin/reviews     (ADMIN)
PUT    /api/v1/admin/companies/:id/verify (ADMIN)
```

## Project Structure

```
Tina/
├── apps/
│   ├── backend/          Express API
│   │   ├── prisma/       Schema + migrations + seeds
│   │   └── src/
│   │       ├── config/   DB, Redis, env
│   │       ├── middleware/
│   │       ├── modules/  auth, companies, services, cart, orders...
│   │       └── lib/      cache, errors, pagination
│   └── frontend/         Next.js 14
│       └── src/
│           ├── app/      Pages (App Router)
│           ├── stores/   Zustand (auth, cart, notifications)
│           ├── hooks/    useDebounce, useNotifications
│           └── lib/      API client, utils
└── packages/
    └── shared/           Types, enums, Zod schemas (shared by both)
```
