# IP Atlas - Network IP Range Manager

A modern Next.js application for managing network IP ranges and allocations.

## Features

- 🔐 **Secure Authentication** - Login system with NextAuth.js
- 🗄️ **Database Integration** - SQLite database with Prisma ORM
- 📊 **IP Range Management** - Create, view, and manage IP ranges
- 🏷️ **IP Address Tracking** - Track IP status, assignments, and details
- 🔍 **Bulk Operations** - Update multiple IP addresses at once
- 📡 **REST API** - Full API for programmatic access
- 📖 **API Documentation** - Interactive API documentation page
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the values in `.env.local` as needed.

4. Initialize the database:
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. Seed with sample data (optional):
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Admin Account

After running the seed script, an admin account will be created. Contact the system administrator for login credentials.

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in (NextAuth.js)
- `POST /api/auth/signout` - Sign out (NextAuth.js)

### IP Ranges
- `GET /api/ip-ranges` - Get all IP ranges
- `POST /api/ip-ranges` - Create new IP range
- `GET /api/ip-ranges/[id]` - Get specific IP range
- `PATCH /api/ip-ranges/[id]` - Update IP range configuration
- `DELETE /api/ip-ranges/[id]` - Delete IP range

### IP Addresses
- `PATCH /api/ip-addresses/[id]` - Update IP address
- `PATCH /api/ip-addresses/bulk-update` - Bulk update IP addresses

### User Management
- `GET /api/user/api-key` - Get current user's API key
- `POST /api/user/api-key` - Generate new API key
- `DELETE /api/user/api-key` - Revoke API key

Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for full API documentation.

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                  # Next.js 13+ app directory
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Main dashboard
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components
├── lib/                 # Utility libraries
├── pages/api/           # API routes
├── prisma/              # Database schema and migrations
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Technology Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth.js
- **Database**: SQLite with Prisma ORM
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Query
