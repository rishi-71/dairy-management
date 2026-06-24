# 🥛 Premium Dairy Management System v2.0

A modern, high-fidelity Enterprise Resource Planning (ERP) web application designed for dairy farm operators. It enables administrators to manage customer directories, configure daily subscription requirements, log daily distributions, track outstanding balances through synchronizing ledgers, print detailed monthly invoices, and query insights using an advanced, integrated AI Copilot.

---

## 📸 System Design & Architecture

### 🏗️ System Architecture
The application is built on a modern serverless model utilizing Next.js Server Actions, NextAuth credentials verification, Prisma ORM, and Vercel AI SDK Core loops linked to the Google Gemini API.

![System Architecture](./assets/architecture.png)

### 🗄️ Database Design
The relational schema leverages Prisma linked to a MySQL database, prioritizing normalization and structured transactional logs to prevent ledger inaccuracies.

![Database Schema](./assets/dbDesign.png)

---

## ✨ Features

*   **📊 Overview & Live KPI Insights**: Dashboard showcasing active subscription counts, catalog capacity, live volume requirements, and outstanding ledgers with animated counter increments.
*   **👥 Customer Directory**: Add, update, and manage subscribers. Each account features details, custom morning/evening milk subscription quotas, and current balances.
*   **🥛 Daily Delivery Logging Grid**: A calendar-based logging workspace. Admins can log distributions, edit daily numbers, and append one-time extra items (e.g., butter, ghee, cheese) to log deliveries.
*   **📑 Ledger Sync & Billing Engine**: Sophisticated transaction ledger syncing. Editing past daily logs automatically recalculates monthly outstanding balances without corrupting previous invoice summaries.
*   **🤖 Integrated AI Core Copilot**: Powered by Gemini and the Vercel AI SDK. The helper chatbot supports natural language commands (e.g., *"Show me Rahul's balance"* or *"Save 2.5L morning delivery for John"*) by executing secure back-end schema queries.
*   **🌘 Premium Dark Mode**: High-contrast, custom glassmorphic dark theme (`dark:bg-slate-950`) equipped with a client-side layout toggle that prevents light-theme rendering flashes on mount.
*   **💎 Visual Elegance (UI/UX)**: Frosted glass boundaries, gradients, dynamic hover transitions, and clean typography powered by **Geist Sans**.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (App Router & Turbopack)
*   **Language**: TypeScript
*   **Database ORM**: Prisma ORM
*   **Database**: MySQL
*   **Styling**: Tailwind CSS v4 & Vanilla CSS
*   **Authentication**: NextAuth.js
*   **AI SDK**: Vercel AI SDK Core & Google Gemini API (`@ai-sdk/google`)

---

## 📁 Repository Structure

```text
├── assets/                  # DB Design & Architecture diagram images
├── prisma/                  # Prisma Database Schemas & Seed Scripts
│   ├── schema.prisma        # Database relational models
│   └── seed.ts              # System bootstrap mock data script
├── src/
│   ├── actions/             # Next.js type-safe Server Actions (Customer, Billing, etc.)
│   ├── ai/                  # AI Copilot engine & tool configuration rules
│   ├── app/                 # Next.js App Router (Pages, Layouts & Sub-routes)
│   ├── components/          # Reusable Client widgets (ThemeToggle, Chatbot)
│   ├── lib/                 # Shared initializations (PrismaClient proxy)
│   └── mcp/                 # Model Context Protocol tools implementation
```

---

## 🚀 Local Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   MySQL Instance

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/dairy-management.git
cd dairy-management
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="mysql://username:password@localhost:3306/dairy_db"
NEXTAUTH_SECRET="your-next-auth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 3. Initialize Database & Run Migrations
Run Prisma migrations to construct database tables and run the seed script to populate mock items/customers:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Boot the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
