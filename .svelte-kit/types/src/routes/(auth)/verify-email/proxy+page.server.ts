// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema/auth';
import type { PageServerLoad } from './$types';

export const load = async ({ url, locals }: Parameters<PageServerLoad>[0]) => {
  const token = url.searchParams.get('token');
  
  if (!token) {
    throw redirect(302, '/login');
  }

  try {
    // Find user with this verification token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email_verification_token, token))
      .limit(1);

    if (!user) {
      return {
        status: 'invalid',
        user: locals.user
      };
    }

    // Check if already verified
    if (user.email_verified) {
      return {
        status: 'already_verified',
        user: locals.user
      };
    }

    // Check if token has expired
    const now = new Date();
    const expiryDate = new Date(user.email_verification_expires || 0);
    
    if (now > expiryDate) {
      return {
        status: 'expired',
        user: locals.user
      };
    }

    // Verify the email
    await db
      .update(users)
      .set({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    return {
      status: 'success',
      user: {
        ...user,
        email_verified: true
      }
    };

  } catch (error) {
    console.error('Email verification error:', error);
    return {
      status: 'invalid',
      user: locals.user
    };
  }
};