import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users, userPreferences, platforms } from '$lib/database/schema/auth';
import { privacySettings } from '$lib/database/schema/privacy';
import { PrivacyQueries } from '$lib/database/queries/privacy';
import { 
  updateProfileSchema, 
  updatePreferencesSchema, 
  changePasswordSchema 
} from '$lib/auth/validation';
import { hashPassword, verifyPassword } from '$lib/auth/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // Get user preferences
  const [userPrefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.user_id, locals.user.id))
    .limit(1);

  // Get privacy settings
  let userPrivacySettings = await PrivacyQueries.getUserPrivacySettings(locals.user.id);
  
  // Create default privacy settings if they don't exist
  if (!userPrivacySettings) {
    userPrivacySettings = await PrivacyQueries.createDefaultPrivacySettings(locals.user.id);
  }

  // Get all platforms for gaming preferences
  const allPlatforms = await db
    .select()
    .from(platforms)
    .where(eq(platforms.is_active, true))
    .orderBy(platforms.name);

  return {
    user: locals.user,
    preferences: userPrefs,
    privacySettings: userPrivacySettings,
    platforms: allPlatforms
  };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = updateProfileSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        message: 'Please fix the errors below'
      });
    }

    try {
      // Update user profile
      await db
        .update(users)
        .set({
          ...result.data,
          updated_at: new Date().toISOString()
        })
        .where(eq(users.id, locals.user.id));

      return {
        success: true,
        message: 'Profile updated successfully!'
      };

    } catch (error) {
      console.error('Profile update error:', error);
      return fail(500, {
        message: 'An error occurred while updating your profile.'
      });
    }
  },

  updateGaming: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
      // Update gaming accounts in user profile
      const gamingData = {
        steam_id: data.steam_id as string || null,
        xbox_gamertag: data.xbox_gamertag as string || null,
        psn_id: data.psn_id as string || null,
        nintendo_friend_code: data.nintendo_friend_code as string || null,
        epic_username: data.epic_username as string || null,
        gog_username: data.gog_username as string || null,
        updated_at: new Date().toISOString()
      };

      await db
        .update(users)
        .set(gamingData)
        .where(eq(users.id, locals.user.id));

      // Update gaming preferences
      const preferencesData = {
        default_platform_id: data.default_platform_id as string || null,
        auto_import_steam: data.auto_import_steam === 'on',
        preferred_rating_system: data.preferred_rating_system as 'controller' | 'stars' | 'numeric' || 'controller',
        updated_at: new Date().toISOString()
      };

      await db
        .update(userPreferences)
        .set(preferencesData)
        .where(eq(userPreferences.user_id, locals.user.id));

      return {
        success: true,
        message: 'Gaming preferences updated successfully!'
      };

    } catch (error) {
      console.error('Gaming preferences update error:', error);
      return fail(500, {
        message: 'An error occurred while updating your gaming preferences.'
      });
    }
  },

  updatePrivacy: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
      const privacyData = {
        privacy_level: data.privacy_level as 'public' | 'friends' | 'private' || 'public',
        show_playtime: data.show_playtime === 'on',
        show_achievements: data.show_achievements === 'on',
        show_activity: data.show_activity === 'on',
        show_wishlist: data.show_wishlist === 'on',
        show_reviews: data.show_reviews === 'on',
        show_library: data.show_library === 'on',
        show_codex: data.show_codex === 'on',
        show_stats: data.show_stats === 'on',
        show_gaming_accounts: data.show_gaming_accounts === 'on',
        allow_friend_requests: data.allow_friend_requests === 'on',
        show_online_status: data.show_online_status === 'on',
        indexable_profile: data.indexable_profile === 'on',
        updated_at: new Date().toISOString()
      };

      await PrivacyQueries.updatePrivacySettings(locals.user.id, privacyData);

      return {
        success: true,
        message: 'Privacy settings updated successfully!'
      };

    } catch (error) {
      console.error('Privacy settings update error:', error);
      return fail(500, {
        message: 'An error occurred while updating your privacy settings.'
      });
    }
  },

  updateNotifications: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
      const notificationData = {
        email_notifications: data.email_notifications === 'on',
        push_notifications: data.push_notifications === 'on',
        friend_requests: data.friend_requests === 'on',
        game_updates: data.game_updates === 'on',
        social_activity: data.social_activity === 'on',
        updated_at: new Date().toISOString()
      };

      await db
        .update(userPreferences)
        .set(notificationData)
        .where(eq(userPreferences.user_id, locals.user.id));

      return {
        success: true,
        message: 'Notification preferences updated successfully!'
      };

    } catch (error) {
      console.error('Notification preferences update error:', error);
      return fail(500, {
        message: 'An error occurred while updating your notification preferences.'
      });
    }
  },

  changePassword: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = changePasswordSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        message: 'Please fix the errors below'
      });
    }

    const { current_password, new_password } = result.data;

    try {
      // Get current user with password hash
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, locals.user.id))
        .limit(1);

      if (!user) {
        return fail(404, { message: 'User not found' });
      }

      // Verify current password
      const validPassword = await verifyPassword(user.password_hash, current_password);
      if (!validPassword) {
        return fail(400, {
          errors: { current_password: ['Current password is incorrect'] },
          message: 'Password change failed'
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(new_password);

      // Update password
      await db
        .update(users)
        .set({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .where(eq(users.id, locals.user.id));

      return {
        success: true,
        message: 'Password updated successfully!'
      };

    } catch (error) {
      console.error('Password change error:', error);
      return fail(500, {
        message: 'An error occurred while changing your password.'
      });
    }
  }
};