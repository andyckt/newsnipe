# Snipe Admin Dashboard

## Authentication Setup

This project uses MongoDB Atlas for the database and NextAuth.js for authentication.

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas account

### Setup Instructions

1. **Clone the repository and install dependencies**

```bash
git clone <repository-url>
cd admin-dashboard
pnpm install
```

2. **Set up MongoDB Atlas**

- Create a MongoDB Atlas account if you don't have one
- Create a new cluster
- Create a database user with read/write permissions
- Get your MongoDB connection string

3. **Configure environment variables**

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snipe?retryWrites=true&w=majority

# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

Replace the placeholder values with your actual MongoDB connection string and generate a secure random string for NEXTAUTH_SECRET.

You can generate a secure random string using:
```bash
openssl rand -base64 32
```

4. **Run the development server**

```bash
pnpm dev
```

5. **Access the application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Authentication Flow

- Users can sign up with name, email, and password
- Users can sign in with email and password
- Authentication state is managed with NextAuth.js
- Protected routes require authentication
- Users are redirected to the dashboard after successful authentication
- Users can sign out from the dashboard

### Project Structure

- `/app/api/auth/[...nextauth]/route.ts` - NextAuth.js API route
- `/app/api/auth/register/route.ts` - User registration API
- `/models/User.ts` - User model for MongoDB
- `/lib/mongodb.ts` - MongoDB connection utility
- `/middleware.ts` - Authentication middleware for protected routes
- `/components/providers/session-provider.tsx` - NextAuth.js session provider
- `/components/user-profile.tsx` - User profile component with sign out functionality
