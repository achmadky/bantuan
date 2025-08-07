# Bantuan Kita

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/achmad-dhikrillahs-projects/bantuin-app-requirements)

## Overview

Bantuan Kita is a platform that connects people who need help with those who can offer assistance. The application allows users to offer their skills and services, which are then reviewed by administrators before being published on the platform. Users looking for help can browse through approved offers and contact service providers directly via WhatsApp.

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router for server-side rendering and routing
- **React 18**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience and code quality
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library built on Radix UI for accessible and customizable UI components
- **Lucide React**: Icon library for modern, consistent icons

### Backend
- **Next.js API Routes**: Serverless functions for handling API requests
- **Firebase Realtime Database**: NoSQL cloud database for storing and syncing data in real-time
- **Telegram Bot API**: Integration for admin notifications and offer management

### State Management
- **React Hooks**: useState, useEffect for local state management
- **React Context**: For sharing state across components (where applicable)

### Form Handling
- **React Hook Form**: For efficient form state management and validation
- **Zod**: TypeScript-first schema validation library

### Deployment
- **Vercel**: Platform for deploying and hosting the application

## Features

### For Users Seeking Help
- Browse available service offers
- Filter offers by skill and city
- Pagination for browsing through multiple offers
- Direct contact with service providers via WhatsApp

### For Service Providers
- Submit offers to provide assistance
- Specify skills, location, and optional payment expectations
- Receive notifications when offers are approved or rejected

### For Administrators
- Admin panel for reviewing pending offers
- Approve or reject submitted offers
- Manage existing offers (view, delete)
- Receive real-time notifications via Telegram when new offers are submitted
- Respond to offers directly from Telegram

## Project Structure

- `/app`: Next.js App Router pages and API routes
  - `/api`: Backend API endpoints
  - `/tawarkan-bantuan`: Form for submitting offers
- `/components`: Reusable UI components
  - `/ui`: Shadcn UI components
- `/lib`: Utility functions and services
  - `data.ts`: Database operations
  - `firebase.ts`: Firebase configuration
  - `telegram.ts`: Telegram bot integration
- `/public`: Static assets
- `/scripts`: Utility scripts for deployment and configuration

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Realtime Database
- Telegram Bot (for admin notifications)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bantuan-kita.git
cd bantuan-kita
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_DATABASE_URL=your_firebase_database_url
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_telegram_admin_chat_id
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Set up Telegram webhook (for production)
```bash
node scripts/set-webhook.js https://your-domain.com/api/telegram-webhook
```

## Deployment

The application is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
