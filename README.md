# IP Atlas - Network IP Range Manager

A modern Next.js application for managing network IP ranges and allocations.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Default Login Credentials](#default-login-credentials)
  - [First Steps After Login](#first-steps-after-login)
- [API Endpoints](#api-endpoints)
- [Database Commands](#database-commands)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Production Deployment](#production-deployment)

## Features

- 🔐 **Secure Authentication** - Login system with NextAuth.js and session management
- 🗄️ **Database Integration** - SQLite database with Prisma ORM
- 📊 **IP Range Management** - Create, view, edit, and delete IP ranges with CIDR notation
- 🏷️ **IP Address Tracking** - Track IP status, assignments, hostname, MAC addresses, and last seen
- 🔍 **Bulk Operations** - Update multiple IP addresses at once with status changes
- 📡 **REST API** - Full API for programmatic access with API key authentication
- 📖 **API Documentation** - Interactive API documentation page
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🏗️ **VLAN Support** - Organize IP ranges by VLAN ID for network segmentation
- 🌐 **DNS Management** - Configure multiple DNS servers per IP range
- 🚪 **Gateway Configuration** - Set default gateways for each network range
- 🔄 **Status Management** - Track IP states: available, used, reserved, offline
- 📈 **Statistics Dashboard** - Overview of IP usage and allocation with filtering options
- 🔧 **User Settings** - Profile management, password changes, and API key generation
- 🏷️ **Range Labels** - Categorize ranges as public, private, or custom labels
- 👁️ **Range Visibility** - Hide/show ranges from statistics and main view
- 📋 **IP Assignment Tracking** - Track who IP addresses are assigned to

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

5. Seed the database with starter admin user:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Login Credentials

After running the seed script, you can log in with:

- **Email**: `admin@ipatlas.local`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these default credentials immediately after your first login!

### First Steps After Login

1. Navigate to Settings and change your password
2. Generate a new API key if needed for API access
3. Start creating your IP ranges and managing your network

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

## Production Deployment

### Prerequisites for Production

- Node.js 18+ on your production server
- A production database (PostgreSQL, MySQL, or SQLite)
- Environment variables properly configured
- SSL certificate for HTTPS (recommended)

### Production Setup

1. **Clone and prepare the application**:
   ```bash
   git clone <repository-url>
   cd ip-atlas
   npm install --production
   ```

2. **Configure production environment variables**:
   Create a `.env.production` file with:
   ```env
   # Database
   DATABASE_URL="your-production-database-url"
   
   # NextAuth
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="generate-a-secure-random-string"
   
   # Optional: Email configuration for password resets
   EMAIL_SERVER_HOST="smtp.your-email-provider.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@domain.com"
   EMAIL_SERVER_PASSWORD="your-email-password"
   EMAIL_FROM="noreply@your-domain.com"
   ```

3. **Update Prisma schema for production database** (if not using SQLite):
   Edit `prisma/schema.prisma` to match your production database:
   ```prisma
   datasource db {
     provider = "postgresql" // or "mysql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Run database migrations**:
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Build the application**:
   ```bash
   npm run build
   ```

6. **Seed initial admin user** (optional):
   ```bash
   npm run db:seed
   ```

7. **Start the production server**:
   ```bash
   npm run start
   ```
   The application will run on port 3000 by default.

### Deployment with PM2

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the application:
   ```bash
   pm2 start npm --name "ip-atlas" -- start
   ```

3. Save PM2 configuration:
   ```bash
   pm2 save
   pm2 startup
   ```

