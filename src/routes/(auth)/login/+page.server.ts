import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema/auth';
import { verifyPassword, sanitizeRedirectUrl } from '$lib/auth/utils';
import { loginSchema } from '$lib/auth/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    const redirectTo = sanitizeRedirectUrl(url.searchParams.get('redirect'));
    throw redirect(302, redirectTo);
  }
  return {};
};

export const actions: Actions = {
  login: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        message: 'Please fix the errors below'
      });
    }

    const { email, password, remember } = result.data;

    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return fail(400, {
          errors: { email: ['Invalid email or password'] },
          message: 'Login failed'
        });
      }

      // Check if user is banned
      if (user.is_banned) {
        return fail(403, {
          message: 'Your account has been suspended. Please contact support.'
        });
      }

      // Verify password
      const validPassword = await verifyPassword(user.password_hash, password);
      if (!validPassword) {
        return fail(400, {
          errors: { password: ['Invalid email or password'] },
          message: 'Login failed'
        });
      }

      // Update last login
      await db
        .update(users)
        .set({ last_login: new Date().toISOString() })
        .where(eq(users.id, user.id));

      // Create session
      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes
      });

      // Redirect to intended page or dashboard
      const redirectTo = sanitizeRedirectUrl(url.searchParams.get('redirect'), '/dashboard');
      throw redirect(302, redirectTo);

    } catch (error) {
      console.error('Login error:', error);
      return fail(500, {
        message: 'An error occurred during login. Please try again.'
      });
    }
  }
};