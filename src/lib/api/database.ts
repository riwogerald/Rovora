// Database schema and operations for user data
import type { User, Wishlist, GameCollection, CollectionGame } from '$lib/types/user';
import type { Review, ReviewVote } from '$lib/types/review';

// Mock database operations - will be replaced with actual database calls
class DatabaseClient {
  private storage: Map<string, any> = new Map();

  // User operations
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false,
      is_private: false,
      follower_count: 0,
      following_count: 0,
      game_count: 0,
      review_count: 0,
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        email_notifications: true,
        push_notifications: true,
        privacy_level: 'public',
        show_activity: true,
        show_wishlist: true,
        show_reviews: true
      }
    };

    this.storage.set(`user:${user.id}`, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.storage.get(`user:${id}`) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('user:') && value.email === email) {
        return value;
      }
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.storage.set(`user:${id}`, updatedUser);
    return updatedUser;
  }

  // Wishlist operations
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    const wishlist: Wishlist[] = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('wishlist:') && value.user_id === userId) {
        wishlist.push(value);
      }
    }
    return wishlist.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  }

  async addToWishlist(wishlistItem: Omit<Wishlist, 'id'>): Promise<Wishlist> {
    const item: Wishlist = {
      ...wishlistItem,
      id: crypto.randomUUID()
    };

    this.storage.set(`wishlist:${item.id}`, item);
    return item;
  }

  async removeFromWishlist(userId: string, gameId: string): Promise<boolean> {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('wishlist:') && value.user_id === userId && value.game_id === gameId) {
        this.storage.delete(key);
        return true;
      }
    }
    return false;
  }

  async updateWishlistItem(id: string, updates: Partial<Wishlist>): Promise<Wishlist | null> {
    const item = this.storage.get(`wishlist:${id}`);
    if (!item) return null;

    const updatedItem = { ...item, ...updates };
    this.storage.set(`wishlist:${id}`, updatedItem);
    return updatedItem;
  }

  // Collections operations
  async getUserCollections(userId: string): Promise<GameCollection[]> {
    const collections: GameCollection[] = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('collection:') && value.user_id === userId) {
        collections.push(value);
      }
    }
    return collections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createCollection(collectionData: Omit<GameCollection, 'id' | 'created_at' | 'updated_at' | 'game_count'>): Promise<GameCollection> {
    const collection: GameCollection = {
      ...collectionData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      game_count: 0
    };

    this.storage.set(`collection:${collection.id}`, collection);
    return collection;
  }

  async getCollection(id: string): Promise<GameCollection | null> {
    return this.storage.get(`collection:${id}`) || null;
  }

  async updateCollection(id: string, updates: Partial<GameCollection>): Promise<GameCollection | null> {
    const collection = await this.getCollection(id);
    if (!collection) return null;

    const updatedCollection = {
      ...collection,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.storage.set(`collection:${id}`, updatedCollection);
    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.storage.delete(`collection:${id}`);
  }

  // Collection games operations
  async getCollectionGames(collectionId: string): Promise<CollectionGame[]> {
    const games: CollectionGame[] = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('collection_game:') && value.collection_id === collectionId) {
        games.push(value);
      }
    }
    return games.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  }

  async addGameToCollection(gameData: Omit<CollectionGame, 'id'>): Promise<CollectionGame> {
    const game: CollectionGame = {
      ...gameData,
      id: crypto.randomUUID()
    };

    this.storage.set(`collection_game:${game.id}`, game);
    
    // Update collection game count
    const collection = await this.getCollection(gameData.collection_id);
    if (collection) {
      await this.updateCollection(collection.id, {
        game_count: collection.game_count + 1
      });
    }

    return game;
  }

  async removeGameFromCollection(collectionId: string, gameId: string): Promise<boolean> {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('collection_game:') && value.collection_id === collectionId && value.game_id === gameId) {
        this.storage.delete(key);
        
        // Update collection game count
        const collection = await this.getCollection(collectionId);
        if (collection) {
          await this.updateCollection(collection.id, {
            game_count: Math.max(0, collection.game_count - 1)
          });
        }
        
        return true;
      }
    }
    return false;
  }

  // Reviews operations
  async createReview(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_count' | 'unhelpful_count'>): Promise<Review> {
    const review: Review = {
      ...reviewData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      helpful_count: 0,
      unhelpful_count: 0
    };

    this.storage.set(`review:${review.id}`, review);
    return review;
  }

  async getReview(id: string): Promise<Review | null> {
    return this.storage.get(`review:${id}`) || null;
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    const reviews: Review[] = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('review:') && value.user_id === userId) {
        reviews.push(value);
      }
    }
    return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getGameReviews(gameId: string): Promise<Review[]> {
    const reviews: Review[] = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('review:') && value.game_id === gameId) {
        reviews.push(value);
      }
    }
    return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const review = await this.getReview(id);
    if (!review) return null;

    const updatedReview = {
      ...review,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.storage.set(`review:${id}`, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.storage.delete(`review:${id}`);
  }

  // Review votes operations
  async voteOnReview(voteData: Omit<ReviewVote, 'id' | 'created_at'>): Promise<ReviewVote> {
    // Remove existing vote if any
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('review_vote:') && value.user_id === voteData.user_id && value.review_id === voteData.review_id) {
        this.storage.delete(key);
        break;
      }
    }

    const vote: ReviewVote = {
      ...voteData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    this.storage.set(`review_vote:${vote.id}`, vote);

    // Update review vote counts
    const review = await this.getReview(voteData.review_id);
    if (review) {
      const votes = await this.getReviewVotes(voteData.review_id);
      const helpfulCount = votes.filter(v => v.is_helpful).length;
      const unhelpfulCount = votes.filter(v => !v.is_helpful).length;

      await this.updateReview(review.id, {
        helpful_count: helpfulCount,
        unhelpful_count: unhelpfulCount
      });
    }

    return vote;
  }

  async getReviewVotes(reviewId: string): Promise<ReviewVote[]> {
    const votes: ReviewVote[] = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('review_vote:') && value.review_id === reviewId) {
        votes.push(value);
      }
    }
    return votes;
  }

  async getUserVoteForReview(userId: string, reviewId: string): Promise<ReviewVote | null> {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('review_vote:') && value.user_id === userId && value.review_id === reviewId) {
        return value;
      }
    }
    return null;
  }
}

// Create singleton instance
export const db = new DatabaseClient();