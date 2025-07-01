import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema/auth';
import { 
  generateEmailVerificationToken, 
  createEmailVerificationExpiry 
} from '$lib/auth/utils';
import { sendVerificationEmail } from '$lib/email/mailer';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // If already verified, redirect to dashboard
  if (locals.user.email_verified) {
    throw redirect(302, '/dashboard');
  }

  return {
    user: locals.user
  };
};

export const actions: Actions = {
  resend: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, {
        message: 'You must be logged in to resend verification email'
      });
    }

    if (locals.user.email_verified) {
      return fail(400, {
        message: 'Your email is already verified'
      });
    }

    try {
      // Generate new verification token
      const verificationToken = generateEmailVerificationToken();
      const verificationExpiry = createEmailVerificationExpiry();

      // Update user with new token
      await db
        .update(users)
        .set({
          email_verification_token: verificationToken,
          email_verification_expires: verificationExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .where(eq(users.id, locals.user.id));

      // Send verification email
      const emailSent = await sendVerificationEmail(
        locals.user.email, 
        locals.user.username, 
        verificationToken
      );

      if (!emailSent) {
        return fail(500, {
          message: 'Failed to send verification email. Please try again.'
        });
      }

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return fail(500, {
        message: 'An error occurred while sending the verification email.'
      });
    }
  }
};