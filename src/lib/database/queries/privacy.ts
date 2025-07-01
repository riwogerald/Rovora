import { eq, and, desc, count, sql } from 'drizzle-orm';
import { db } from '../connection';
import { 
  privacySettings, 
  blockedUsers, 
  profileViews, 
  contentReports,
  users,
  follows
} from '../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { PrivacySettings, PrivacyContext } from '$lib/utils/privacy';

export type PrivacySettingsRow = InferSelectModel<typeof privacySettings>;
export type BlockedUser = InferSelectModel<typeof blockedUsers>;
export type ProfileView = InferSelectModel<typeof profileViews>;

export class PrivacyQueries {
  // Get user's privacy settings
  static async getUserPrivacySettings(userId: string): Promise<PrivacySettingsRow | null> {
    const [settings] = await db
      .select()
      .from(privacySettings)
      .where(eq(privacySettings.user_id, userId))
      .limit(1);

    return settings || null;
  }

  // Create default privacy settings for new user
  static async createDefaultPrivacySettings(userId: string): Promise<PrivacySettingsRow> {
    const [settings] = await db
      .insert(privacySettings)
      .values({ user_id: userId })
      .returning();

    return settings;
  }

  // Update privacy settings
  static async updatePrivacySettings(
    userId: string, 
    updates: Partial<PrivacySettingsRow>
  ): Promise<PrivacySettingsRow> {
    const [updated] = await db
      .update(privacySettings)
      .set({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .where(eq(privacySettings.user_id, userId))
      .returning();

    return updated;
  }

  // Check if user can view another user's profile
  static async canViewProfile(
    viewerId: string | null, 
    profileOwnerId: string
  ): Promise<boolean> {
    // Owner can always view their own profile
    if (viewerId === profileOwnerId) return true;

    // Get privacy settings
    const settings = await this.getUserPrivacySettings(profileOwnerId);
    if (!settings) return true; // Default to public if no settings

    // Check privacy level
    switch (settings.privacy_level) {
      case 'public':
        return true;
      case 'friends':
        if (!viewerId) return false;
        return await this.areFriends(viewerId, profileOwnerId);
      case 'private':
        return false;
      default:
        return false;
    }
  }

  // Check if two users are friends
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.follower_id, userId1),
          eq(follows.following_id, userId2),
          eq(follows.follow_type, 'follow')
        )
      )
      .limit(1);

    const reverseFriendship = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.follower_id, userId2),
          eq(follows.following_id, userId1),
          eq(follows.follow_type, 'follow')
        )
      )
      .limit(1);

    // Both users must follow each other to be considered friends
    return friendship.length > 0 && reverseFriendship.length > 0;
  }

  // Block a user
  static async blockUser(
    blockerId: string, 
    blockedId: string, 
    reason?: string
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Add to blocked users
      await tx.insert(blockedUsers).values({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason
      });

      // Remove any existing follow relationships
      await tx
        .delete(follows)
        .where(
          and(
            eq(follows.follower_id, blockerId),
            eq(follows.following_id, blockedId)
          )
        );

      await tx
        .delete(follows)
        .where(
          and(
            eq(follows.follower_id, blockedId),
            eq(follows.following_id, blockerId)
          )
        );
    });
  }

  // Unblock a user
  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await db
      .delete(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blocker_id, blockerId),
          eq(blockedUsers.blocked_id, blockedId)
        )
      );
  }

  // Check if user is blocked
  static async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blocked = await db
      .select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blocker_id, blockerId),
          eq(blockedUsers.blocked_id, blockedId)
        )
      )
      .limit(1);

    return blocked.length > 0;
  }

  // Get user's blocked list
  static async getBlockedUsers(userId: string, limit = 20, offset = 0) {
    return await db
      .select({
        blockedUser: users,
        blockInfo: blockedUsers
      })
      .from(blockedUsers)
      .innerJoin(users, eq(blockedUsers.blocked_id, users.id))
      .where(eq(blockedUsers.blocker_id, userId))
      .orderBy(desc(blockedUsers.created_at))
      .limit(limit)
      .offset(offset);
  }

  // Record profile view
  static async recordProfileView(
    profileOwnerId: string,
    viewerId?: string,
    metadata?: {
      ip_address?: string;
      user_agent?: string;
      referrer?: string;
    }
  ): Promise<void> {
    // Don't record views of own profile
    if (viewerId === profileOwnerId) return;

    await db.insert(profileViews).values({
      profile_owner_id: profileOwnerId,
      viewer_id: viewerId || null,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      referrer: metadata?.referrer
    });
  }

  // Get profile view stats
  static async getProfileViewStats(profileOwnerId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalViews] = await db
      .select({ count: count() })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profile_owner_id, profileOwnerId),
          sql`${profileViews.created_at} >= ${since.toISOString()}`
        )
      );

    const [uniqueViews] = await db
      .select({ count: count(sql`DISTINCT ${profileViews.viewer_id}`) })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profile_owner_id, profileOwnerId),
          sql`${profileViews.created_at} >= ${since.toISOString()}`,
          sql`${profileViews.viewer_id} IS NOT NULL`
        )
      );

    return {
      total_views: totalViews.count,
      unique_views: uniqueViews.count,
      period_days: days
    };
  }

  // Report content
  static async reportContent(
    reporterId: string,
    contentType: string,
    contentId: string,
    reason: string,
    description?: string,
    reportedUserId?: string
  ) {
    const [report] = await db
      .insert(contentReports)
      .values({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        content_type: contentType as any,
        content_id: contentId,
        reason: reason as any,
        description
      })
      .returning();

    return report;
  }

  // Get privacy context for a user interaction
  static async getPrivacyContext(
    viewerId: string | null,
    profileOwnerId: string
  ): Promise<PrivacyContext> {
    const [viewer, profileOwner, settings] = await Promise.all([
      viewerId ? db.select().from(users).where(eq(users.id, viewerId)).limit(1) : Promise.resolve([null]),
      db.select().from(users).where(eq(users.id, profileOwnerId)).limit(1),
      this.getUserPrivacySettings(profileOwnerId)
    ]);

    const isOwnProfile = viewerId === profileOwnerId;
    const isFriend = viewerId ? await this.areFriends(viewerId, profileOwnerId) : false;

    return {
      viewer: viewer?.[0] || null,
      profileOwner: profileOwner[0],
      isOwnProfile,
      isFriend,
      privacySettings: settings || {
        privacy_level: 'public',
        show_playtime: true,
        show_achievements: true,
        show_activity: true,
        show_wishlist: true,
        show_reviews: true,
        show_library: true,
        show_codex: true,
        show_stats: true,
        show_gaming_accounts: true,
        allow_friend_requests: true,
        show_online_status: true,
        indexable_profile: true
      }
    };
  }
}