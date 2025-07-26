import { eq, and, desc, asc, like, inArray, count, sql, or, not } from 'drizzle-orm';
import { db } from '../connection';
import { 
  follows, activities, likes, comments, gameLists, gameListEntries, listFollows,
  users, games, codexEntries, gameEntries
} from '../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Follow = InferSelectModel<typeof follows>;
export type Activity = InferSelectModel<typeof activities>;
export type Like = InferSelectModel<typeof likes>;
export type Comment = InferSelectModel<typeof comments>;
export type GameList = InferSelectModel<typeof gameLists>;

export interface ActivityWithDetails extends Activity {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  game?: {
    id: string;
    title: string;
    slug: string;
    cover_image?: string;
  };
  codex_entry?: {
    id: string;
    title: string;
    entry_type: string;
  };
  target_user?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface CommentWithDetails extends Comment {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  replies?: CommentWithDetails[];
  is_liked?: boolean;
}

export interface GameListWithDetails extends GameList {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  games: Array<{
    id: string;
    title: string;
    cover_image?: string;
    position?: number;
    notes?: string;
  }>;
  is_following?: boolean;
}

export class SocialQueries {
  // === FOLLOW SYSTEM ===
  
  // Follow a user
  static async followUser(followerId: string, followingId: string): Promise<Follow> {
    // Check if already following
    const existing = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.follower_id, followerId),
          eq(follows.following_id, followingId)
        )
      )
      .limit(1);

    if (existing[0]) {
      throw new Error('Already following this user');
    }

    return await db.transaction(async (tx) => {
      // Create follow relationship
      const [follow] = await tx
        .insert(follows)
        .values({
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        })
        .returning();

      // Update user stats
      await tx
        .update(users)
        .set({ 
          following_count: sql`${users.following_count} + 1`
        })
        .where(eq(users.id, followerId));

      await tx
        .update(users)
        .set({ 
          followers_count: sql`${users.followers_count} + 1`
        })
        .where(eq(users.id, followingId));

      // Create activity
      await tx
        .insert(activities)
        .values({
          user_id: followerId,
          type: 'user_followed',
          target_user_id: followingId,
          created_at: new Date().toISOString()
        });

      return follow;
    });
  }

  // Unfollow a user
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const result = await tx
        .delete(follows)
        .where(
          and(
            eq(follows.follower_id, followerId),
            eq(follows.following_id, followingId)
          )
        );

      if (result.changes === 0) {
        return false;
      }

      // Update user stats
      await tx
        .update(users)
        .set({ 
          following_count: sql`${users.following_count} - 1`
        })
        .where(eq(users.id, followerId));

      await tx
        .update(users)
        .set({ 
          followers_count: sql`${users.followers_count} - 1`
        })
        .where(eq(users.id, followingId));

      return true;
    });
  }

  // Check if user is following another user
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .select({ id: follows.id })
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

  // Get user's followers
  static async getUserFollowers(userId: string, limit = 20, offset = 0) {
    return await db
      .select({
        follow: follows,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        }
      })
      .from(follows)
      .innerJoin(users, eq(follows.follower_id, users.id))
      .where(eq(follows.following_id, userId))
      .orderBy(desc(follows.created_at))
      .limit(limit)
      .offset(offset);
  }

  // Get user's following
  static async getUserFollowing(userId: string, limit = 20, offset = 0) {
    return await db
      .select({
        follow: follows,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        }
      })
      .from(follows)
      .innerJoin(users, eq(follows.following_id, users.id))
      .where(eq(follows.follower_id, userId))
      .orderBy(desc(follows.created_at))
      .limit(limit)
      .offset(offset);
  }

  // === ACTIVITY FEED ===

  // Create activity
  static async createActivity(data: InferInsertModel<typeof activities>): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({
        ...data,
        created_at: new Date().toISOString()
      })
      .returning();

    return activity;
  }

  // Get user's activity feed (activities from followed users)
  static async getUserFeed(userId: string, limit = 20, offset = 0): Promise<ActivityWithDetails[]> {
    // Get followed user IDs
    const followedUsers = await db
      .select({ id: follows.following_id })
      .from(follows)
      .where(eq(follows.follower_id, userId));

    const followedUserIds = followedUsers.map(f => f.id);
    followedUserIds.push(userId); // Include own activities

    if (followedUserIds.length === 0) {
      return [];
    }

    const results = await db
      .select({
        activity: activities,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        },
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        },
        codex_entry: {
          id: codexEntries.id,
          title: codexEntries.title,
          entry_type: codexEntries.entry_type
        },
        target_user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        }
      })
      .from(activities)
      .innerJoin(users, eq(activities.user_id, users.id))
      .leftJoin(games, eq(activities.game_id, games.id))
      .leftJoin(codexEntries, eq(activities.codex_entry_id, codexEntries.id))
      .leftJoin(users as any, eq(activities.target_user_id, users.id))
      .where(
        and(
          inArray(activities.user_id, followedUserIds),
          eq(activities.is_public, true)
        )
      )
      .orderBy(desc(activities.created_at))
      .limit(limit)
      .offset(offset);

    return results.map(({ activity, user, game, codex_entry, target_user }) => ({
      ...activity,
      user,
      game: game || undefined,
      codex_entry: codex_entry || undefined,
      target_user: target_user || undefined
    }));
  }

  // Get user's own activities
  static async getUserActivities(userId: string, limit = 20, offset = 0) {
    const results = await db
      .select({
        activity: activities,
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        },
        codex_entry: {
          id: codexEntries.id,
          title: codexEntries.title,
          entry_type: codexEntries.entry_type
        }
      })
      .from(activities)
      .leftJoin(games, eq(activities.game_id, games.id))
      .leftJoin(codexEntries, eq(activities.codex_entry_id, codexEntries.id))
      .where(eq(activities.user_id, userId))
      .orderBy(desc(activities.created_at))
      .limit(limit)
      .offset(offset);

    return results;
  }

  // === LIKES SYSTEM ===

  // Like/unlike a codex entry
  static async toggleCodexEntryLike(userId: string, codexEntryId: string): Promise<{ liked: boolean }> {
    return await db.transaction(async (tx) => {
      // Check if already liked
      const existing = await tx
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.user_id, userId),
            eq(likes.codex_entry_id, codexEntryId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Remove like
        await tx
          .delete(likes)
          .where(eq(likes.id, existing[0].id));

        // Decrement like count
        await tx
          .update(codexEntries)
          .set({
            likes_count: sql`${codexEntries.likes_count} - 1`
          })
          .where(eq(codexEntries.id, codexEntryId));

        return { liked: false };
      } else {
        // Add like
        await tx
          .insert(likes)
          .values({
            user_id: userId,
            codex_entry_id: codexEntryId,
            created_at: new Date().toISOString()
          });

        // Increment like count
        await tx
          .update(codexEntries)
          .set({
            likes_count: sql`${codexEntries.likes_count} + 1`
          })
          .where(eq(codexEntries.id, codexEntryId));

        return { liked: true };
      }
    });
  }

  // Check if user liked a codex entry
  static async hasLikedCodexEntry(userId: string, codexEntryId: string): Promise<boolean> {
    const result = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.user_id, userId),
          eq(likes.codex_entry_id, codexEntryId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // === COMMENTS SYSTEM ===

  // Create comment
  static async createComment(
    userId: string,
    codexEntryId: string,
    content: string,
    parentCommentId?: string
  ): Promise<Comment> {
    return await db.transaction(async (tx) => {
      const [comment] = await tx
        .insert(comments)
        .values({
          user_id: userId,
          codex_entry_id: codexEntryId,
          parent_comment_id: parentCommentId,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .returning();

      // Update comment count on codex entry
      await tx
        .update(codexEntries)
        .set({
          comments_count: sql`${codexEntries.comments_count} + 1`
        })
        .where(eq(codexEntries.id, codexEntryId));

      // Update reply count on parent comment if this is a reply
      if (parentCommentId) {
        await tx
          .update(comments)
          .set({
            replies_count: sql`${comments.replies_count} + 1`
          })
          .where(eq(comments.id, parentCommentId));
      }

      return comment;
    });
  }

  // Get comments for codex entry
  static async getCodexEntryComments(
    codexEntryId: string,
    userId?: string,
    limit = 20,
    offset = 0
  ): Promise<CommentWithDetails[]> {
    // Get top-level comments
    const results = await db
      .select({
        comment: comments,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        }
      })
      .from(comments)
      .innerJoin(users, eq(comments.user_id, users.id))
      .where(
        and(
          eq(comments.codex_entry_id, codexEntryId),
          sql`${comments.parent_comment_id} IS NULL`
        )
      )
      .orderBy(desc(comments.created_at))
      .limit(limit)
      .offset(offset);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      results.map(async ({ comment, user }) => {
        const replies = await this.getCommentReplies(comment.id, userId);
        const is_liked = userId ? await this.hasLikedComment(userId, comment.id) : false;

        return {
          ...comment,
          user,
          replies,
          is_liked
        };
      })
    );

    return commentsWithReplies;
  }

  // Get replies for a comment
  private static async getCommentReplies(commentId: string, userId?: string): Promise<CommentWithDetails[]> {
    const results = await db
      .select({
        comment: comments,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        }
      })
      .from(comments)
      .innerJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.parent_comment_id, commentId))
      .orderBy(asc(comments.created_at));

    return await Promise.all(
      results.map(async ({ comment, user }) => {
        const is_liked = userId ? await this.hasLikedComment(userId, comment.id) : false;
        return {
          ...comment,
          user,
          is_liked
        };
      })
    );
  }

  // Like/unlike a comment
  static async toggleCommentLike(userId: string, commentId: string): Promise<{ liked: boolean }> {
    return await db.transaction(async (tx) => {
      // Check if already liked
      const existing = await tx
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.user_id, userId),
            eq(likes.comment_id, commentId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Remove like
        await tx
          .delete(likes)
          .where(eq(likes.id, existing[0].id));

        // Decrement like count
        await tx
          .update(comments)
          .set({
            likes_count: sql`${comments.likes_count} - 1`
          })
          .where(eq(comments.id, commentId));

        return { liked: false };
      } else {
        // Add like
        await tx
          .insert(likes)
          .values({
            user_id: userId,
            comment_id: commentId,
            created_at: new Date().toISOString()
          });

        // Increment like count
        await tx
          .update(comments)
          .set({
            likes_count: sql`${comments.likes_count} + 1`
          })
          .where(eq(comments.id, commentId));

        return { liked: true };
      }
    });
  }

  // Check if user liked a comment
  static async hasLikedComment(userId: string, commentId: string): Promise<boolean> {
    const result = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.user_id, userId),
          eq(likes.comment_id, commentId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // === GAME LISTS ===

  // Create game list
  static async createGameList(data: Omit<InferInsertModel<typeof gameLists>, 'id' | 'created_at' | 'updated_at'>): Promise<GameList> {
    const [gameList] = await db
      .insert(gameLists)
      .values({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning();

    return gameList;
  }

  // Get user's game lists
  static async getUserGameLists(userId: string, includePrivate = false): Promise<GameListWithDetails[]> {
    const conditions = [eq(gameLists.user_id, userId)];
    if (!includePrivate) {
      conditions.push(eq(gameLists.is_public, true));
    }

    const results = await db
      .select({
        list: gameLists,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        }
      })
      .from(gameLists)
      .innerJoin(users, eq(gameLists.user_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(gameLists.updated_at));

    // Get games for each list
    return await Promise.all(
      results.map(async ({ list, user }) => {
        const games = await this.getGameListGames(list.id);
        return {
          ...list,
          user,
          games
        };
      })
    );
  }

  // Get games in a list
  private static async getGameListGames(listId: string) {
    const results = await db
      .select({
        game: {
          id: games.id,
          title: games.title,
          cover_image: games.cover_image
        },
        entry: {
          position: gameListEntries.position,
          notes: gameListEntries.notes
        }
      })
      .from(gameListEntries)
      .innerJoin(games, eq(gameListEntries.game_id, games.id))
      .where(eq(gameListEntries.list_id, listId))
      .orderBy(asc(gameListEntries.position));

    return results.map(({ game, entry }) => ({
      ...game,
      position: entry.position,
      notes: entry.notes
    }));
  }

  // Add game to list
  static async addGameToList(
    listId: string,
    gameId: string,
    addedByUserId: string,
    position?: number,
    notes?: string
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .insert(gameListEntries)
        .values({
          list_id: listId,
          game_id: gameId,
          added_by_user_id: addedByUserId,
          position,
          notes,
          created_at: new Date().toISOString()
        });

      // Update games count
      await tx
        .update(gameLists)
        .set({
          games_count: sql`${gameLists.games_count} + 1`,
          updated_at: new Date().toISOString()
        })
        .where(eq(gameLists.id, listId));
    });
  }

  // Search users
  static async searchUsers(query: string, limit = 20, offset = 0) {
    const searchTerm = `%${query}%`;
    
    return await db
      .select({
        id: users.id,
        username: users.username,
        display_name: users.display_name,
        avatar_url: users.avatar_url,
        bio: users.bio,
        followers_count: users.followers_count,
        following_count: users.following_count
      })
      .from(users)
      .where(
        or(
          like(users.username, searchTerm),
          like(users.display_name, searchTerm)
        )
      )
      .orderBy(desc(users.followers_count))
      .limit(limit)
      .offset(offset);
  }
}
