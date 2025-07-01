import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/database/connection';
import { users, userPreferences, userStats } from '$lib/database/schema/auth';
import { 
  hashPassword, 
  sanitizeRedirectUrl, 
  generateEmailVerificationToken, 
  createEmailVerificationExpiry 
} from '$lib/auth/utils';
import { registerSchema } from '$lib/auth/validation';
import { sendVerificationEmail } from '$lib/email/mailer';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    const redirectTo = sanitizeRedirectUrl(url.searchParams.get('redirect'));
    throw redirect(302, redirectTo);
  }
  return {};
};

export const actions: Actions = {
  register: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        message: 'Please fix the errors below'
      });
    }

    const { username, email, password } = result.data;

    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return fail(400, {
          errors: { email: ['An account with this email already exists'] },
          message: 'Registration failed'
        });
      }

      // Check if username is taken
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername.length > 0) {
        return fail(400, {
          errors: { username: ['This username is already taken'] },
          message: 'Registration failed'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate email verification token
      const verificationToken = generateEmailVerificationToken();
      const verificationExpiry = createEmailVerificationExpiry();

      // Create user in transaction
      const newUser = await db.transaction(async (tx) => {
        // Create user
        const [user] = await tx
          .insert(users)
          .values({
            username,
            email,
            password_hash: passwordHash,
            display_name: username,
            email_verified: false,
            email_verification_token: verificationToken,
            email_verification_expires: verificationExpiry.toISOString()
          })
          .returning();

        // Create default preferences
        await tx.insert(userPreferences).values({
          user_id: user.id
        });

        // Create default stats
        await tx.insert(userStats).values({
          user_id: user.id
        });

        return user;
      });

      // Send verification email
      const emailSent = await sendVerificationEmail(email, username, verificationToken);
      
      if (!emailSent) {
        console.error('Failed to send verification email');
        // Don't fail registration if email fails, just log it
      }

      // Create session (user can use the app but with limited features until verified)
      const session = await lucia.createSession(newUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes
      });

      // Redirect to verification notice page
      throw redirect(302, '/verify-email-notice');

    } catch (error) {
      console.error('Registration error:', error);
      return fail(500, {
        message: 'An error occurred during registration. Please try again.'
      });
    }
  }
};