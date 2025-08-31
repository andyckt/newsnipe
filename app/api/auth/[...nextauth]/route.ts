import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { NextAuthOptions } from 'next-auth';

// Extend the User type to include the remember property
declare module "next-auth" {
  interface User {
    remember?: boolean;
  }
  
  interface Session {
    maxAge?: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectToDatabase();
        
        // Find user by email and explicitly select password field
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        // Check if password matches
        const isPasswordValid = await user.comparePassword(credentials.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }
        
        // Store the remember me preference in the token
        const remember = req?.body?.remember === 'true' || req?.body?.remember === true;
        
        // Return user object without password
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          remember,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Store the remember me preference in the token
        // @ts-ignore - we're adding a custom property to the token
        token.remember = user.remember;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        
        // Set the maxAge based on the remember me preference
        // @ts-ignore - we're accessing a custom property on the token
        if (token.remember) {
          // If remember me is checked, extend session to 30 days
          session.maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
        } else {
          // Otherwise, use the default session duration (3 days)
          session.maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
    // Default session duration is 3 days, extended to 30 days if "Remember me" is checked
    maxAge: 3 * 24 * 60 * 60, // 3 days by default
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
