// @ts-nocheck
import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema/auth';
import { hashPassword } from '$lib/auth/utils';
import { resetPasswordSchema } from '$lib/auth/validation';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const token = url.searchParams.get('token');
  
  if (!token) {
    throw redirect(302, '/forgot-password');
  }

  try {
    // Find user with this reset token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.password_reset_token, token))
      .limit(1);

    if (!user) {
      return {
        status: 'invalid',
        token
      };
    }

    // Check if token has expired
    const now = new Date();
    const expiryDate = new Date(user.password_reset_expires || 0);
    
    if (now > expiryDate) {
      return {
        status: 'expired',
        token
      };
    }

    return {
      status: 'valid',
      token
    };

  } catch (error) {
    console.error('Password reset validation error:', error);
    return {
      status: 'invalid',
      token
    };
  }
};

export const actions = {
  reset: async ({ request, cookies }: import('./$types').RequestEvent) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        message: 'Please fix the errors below'
      });
    }

    const { password, token } = result.data;

    try {
      // Find user with this reset token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.password_reset_token, token))
        .limit(1);

      if (!user) {
        return fail(400, {
          message: 'Invalid or expired reset token'
        });
      }

      // Check if token has expired
      const now = new Date();
      const expiryDate = new Date(user.password_reset_expires || 0);
      
      if (now > expiryDate) {
        return fail(400, {
          message: 'Reset token has expired'
        });
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update user password and clear reset token
      await db
        .update(users)
        .set({
          password_hash: passwordHash,
          password_reset_token: null,
          password_reset_expires: null,
          updated_at: new Date().toISOString()
        })
        .where(eq(users.id, user.id));

      // Invalidate all existing sessions for security
      await lucia.invalidateUserSessions(user.id);

      // Create new session
      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes
      });

      throw redirect(302, '/dashboard?password-reset=success');

    } catch (error) {
      if (error instanceof Response) {
        throw error; // Re-throw redirect
      }
      
      console.error('Password reset error:', error);
      return fail(500, {
        message: 'An error occurred while resetting your password. Please try again.'
      });
    }
  }
};;null as any as Actions;