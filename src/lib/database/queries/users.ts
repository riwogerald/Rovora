import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../connection';
import { users, userPreferences, userStats, follows } from '../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserPreferences = InferSelectModel<typeof userPreferences>;
export type UserStats = InferSelectModel<typeof userStats>;

export class UserQueries {
  // Create new user with default preferences and stats
  static async createUser(userData: Omit<NewUser, 'id' | 'created_at' | 'updated_at'>) {
    return await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx.insert(users).values(userData).returning();
      
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
  }

  // Get user by ID with preferences and stats
  static async getUserById(userId: string) {
    const result = await db
      .select({
        user: users,
        preferences: userPreferences,
        stats: userStats
      })
      .from(users)
      .leftJoin(userPreferences, eq(users.id, userPreferences.user_id))
      .leftJoin(userStats, eq(users.id, userStats.user_id))
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  }

  // Get user by username
  static async getUserByUsername(username: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  // Update user profile
  static async updateUser(userId: string, updates: Partial<User>) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...preferences, updated_at: new Date().toISOString() })
      .where(eq(userPreferences.user_id, userId))
      .returning();

    return updated;
  }

  // Update user stats
  static async updateUserStats(userId: string, stats: Partial<UserStats>) {
    const [updated] = await db
      .update(userStats)
      .set({ ...stats, updated_at: new Date().toISOString() })
      .where(eq(userStats.user_id, userId))
      .returning();

    return updated;
  }

  // Follow/unfollow user
  static async followUser(followerId: string, followingId: string) {
    return await db.transaction(async (tx) => {
      // Insert follow relationship
      await tx.insert(follows).values({
        follower_id: followerId,
        following_id: followingId
      });

      // Update follower count
      await tx
        .update(userStats)
        .set({ 
          following_count: count(follows.following_id)
        })
        .where(eq(userStats.user_id, followerId));

      // Update following count
      await tx
        .update(userStats)
        .set({ 
          followers_count: count(follows.follower_id)
        })
        .where(eq(userStats.user_id, followingId));
    });
  }

  static async unfollowUser(followerId: string, followingId: string) {
    return await db.transaction(async (tx) => {
      // Remove follow relationship
      await tx
        .delete(follows)
        .where(
          and(
            eq(follows.follower_id, followerId),
            eq(follows.following_id, followingId)
          )
        );

      // Update counts (similar to followUser but decrement)
      // Implementation would be similar but with proper count recalculation
    });
  }

  // Get user's followers
  static async getUserFollowers(userId: string, limit = 20, offset = 0) {
    return await db
      .select({
        user: users,
        followedAt: follows.created_at
      })
      .from(follows)
      .innerJoin(users, eq(follows.follower_id, users.id))
      .where(eq(follows.following_id, userId))
      .orderBy(desc(follows.created_at))
      .limit(limit)
      .offset(offset);
  }

  // Get users that user is following
  static async getUserFollowing(userId: string, limit = 20, offset = 0) {
    return await db
      .select({
        user: users,
        followedAt: follows.created_at
      })
      .from(follows)
      .innerJoin(users, eq(follows.following_id, users.id))
      .where(eq(follows.follower_id, userId))
      .orderBy(desc(follows.created_at))
      .limit(limit)
      .offset(offset);
  }

  // Check if user is following another user
  static async isFollowing(followerId: string, followingId: string) {
    const result = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.follower_id, followerId),
          eq(follows.following_id, followingId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Search users
  static async searchUsers(query: string, limit = 20, offset = 0) {
    return await db
      .select({
        user: users,
        stats: userStats
      })
      .from(users)
      .leftJoin(userStats, eq(users.id, userStats.user_id))
      .where(
        // Simple text search - in production, use FTS or external search
        // This is a basic implementation
        eq(users.username, query) // Would need proper LIKE or FTS implementation
      )
      .limit(limit)
      .offset(offset);
  }
}