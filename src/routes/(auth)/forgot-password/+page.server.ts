import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema/auth';
import { 
  generatePasswordResetToken, 
  createPasswordResetExpiry 
} from '$lib/auth/utils';
import { forgotPasswordSchema } from '$lib/auth/validation';
import { sendPasswordResetEmail } from '$lib/email/mailer';
import type { Actions } from './$types';

export const actions: Actions = {
  forgot: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = forgotPasswordSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        message: 'Please fix the errors below'
      });
    }

    const { email } = result.data;

    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      // Always return success to prevent email enumeration
      // But only send email if user exists
      if (user && !user.is_banned) {
        // Generate password reset token
        const resetToken = generatePasswordResetToken();
        const resetExpiry = createPasswordResetExpiry();

        // Update user with reset token
        await db
          .update(users)
          .set({
            password_reset_token: resetToken,
            password_reset_expires: resetExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .where(eq(users.id, user.id));

        // Send password reset email
        const emailSent = await sendPasswordResetEmail(
          email, 
          user.username, 
          resetToken
        );

        if (!emailSent) {
          console.error('Failed to send password reset email');
          // Don't fail the request, just log it
        }
      }

      return {
        success: true,
        message: 'If an account with that email exists, we\'ve sent you a reset link.'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return fail(500, {
        message: 'An error occurred while processing your request. Please try again.'
      });
    }
  }
};