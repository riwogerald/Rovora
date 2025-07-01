import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/database/connection';
import { sessions, users } from '$lib/database/schema/auth';
import { dev } from '$app/environment';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev,
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      display_name: attributes.display_name,
      avatar_url: attributes.avatar_url,
      bio: attributes.bio,
      location: attributes.location,
      website: attributes.website,
      steam_id: attributes.steam_id,
      xbox_gamertag: attributes.xbox_gamertag,
      psn_id: attributes.psn_id,
      nintendo_friend_code: attributes.nintendo_friend_code,
      epic_username: attributes.epic_username,
      gog_username: attributes.gog_username,
      is_verified: attributes.is_verified,
      is_private: attributes.is_private,
      is_banned: attributes.is_banned,
      email_verified: attributes.email_verified,
      created_at: attributes.created_at,
      updated_at: attributes.updated_at,
      last_login: attributes.last_login
    };
  }
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      username: string;
      email: string;
      display_name: string | null;
      avatar_url: string | null;
      bio: string | null;
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