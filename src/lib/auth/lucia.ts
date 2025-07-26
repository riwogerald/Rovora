import { SvelteKitAuth } from '@auth/sveltekit';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from '@auth/sveltekit/providers/credentials';
import GitHub from '@auth/sveltekit/providers/github';
import Google from '@auth/sveltekit/providers/google';
import { db } from '$lib/database/connection';
import { users, sessions, userPreferences, userStats } from '$lib/database/schema/auth';
import { eq } from 'drizzle-orm';
import { verify } from 'argon2';
import { dev } from '$app/environment';
import {
  GITHUB_ID,
  GITHUB_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  AUTH_SECRET
} from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    sessionsTable: sessions,
  }),
  providers: [
    // Credentials provider for email/password login
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!user[0]) {
            return null;
          }

          const isValidPassword = await verify(
            user[0].password_hash,
            credentials.password as string
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].display_name || user[0].username,
            image: user[0].avatar_url,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
    // OAuth providers
    GitHub({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET,
    }),
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    })
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: dev ? 'authjs.session-token' : '__Secure-authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !dev
      }
    }
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // Fetch additional user data
        const userData = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (userData[0]) {
          session.user = {
            ...session.user,
            id: userData[0].id,
            username: userData[0].username,
            email: userData[0].email,
            display_name: userData[0].display_name,
            avatar_url: userData[0].avatar_url,
            is_verified: userData[0].is_verified,
            is_private: userData[0].is_private,
            is_banned: userData[0].is_banned,
            email_verified: userData[0].email_verified,
            created_at: userData[0].created_at,
            updated_at: userData[0].updated_at,
            last_login: userData[0].last_login
          };
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  secret: AUTH_SECRET,
  trustHost: true
});
      location: string | null;
      website: string | null;
      steam_id: string | null;
      xbox_gamertag: string | null;
      psn_id: string | null;
      nintendo_friend_code: string | null;
      epic_username: string | null;
      gog_username: string | null;
      is_verified: boolean;
      is_private: boolean;
      is_banned: boolean;
      email_verified: boolean;
      created_at: string;
      updated_at: string;
      last_login: string | null;
    };
  }
}