# Admin Dashboard

A comprehensive admin dashboard with authentication, MongoDB integration, and modern UI.

## Features

- User authentication with NextAuth.js
- MongoDB Atlas integration for data storage
- Protected routes
- Modern UI with Tailwind CSS
- Social login with Google
- Responsive design

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file based on `.env.local.example`:
   ```
   # MongoDB
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority&appName=<appName>

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_a_random_secret_here

   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Authentication Setup

1. Create a MongoDB Atlas account and database
2. Set up OAuth application for Google
3. Update the `.env.local` file with your credentials
4. Generate a random string for NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

## Deployment

1. Update the `NEXTAUTH_URL` in `.env.local` to your production URL
2. Deploy to your preferred hosting platform (Vercel recommended)
3. Set up environment variables on your hosting platform

## Tech Stack

- Next.js
- NextAuth.js
- MongoDB with Mongoose
- Tailwind CSS
- TypeScript
- React
