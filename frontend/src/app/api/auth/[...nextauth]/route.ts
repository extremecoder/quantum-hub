import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

/**
 * NextAuth configuration with Credentials and Google OAuth providers
 */
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Use absolute URL for server-side requests
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
          const tokenUrl = `${baseUrl}/api/proxy/token`;

          console.log("Fetching token from:", tokenUrl);

          const response = await axios.post(tokenUrl, {
            username: credentials.username,
            password: credentials.password,
          });

          console.log('Auth response:', response.data);

          if (response.data.access_token) {
            // Return user data with token
            return {
              id: response.data.user?.id || 'user-id',
              name: response.data.user?.full_name || response.data.user?.username,
              email: response.data.user?.email,
              access_token: response.data.access_token,
              user: response.data.user,
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
