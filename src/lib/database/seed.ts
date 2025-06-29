import { db } from './connection';
import { 
  users, userPreferences, userStats,
  games, platforms, genres, tags,
  gamePlatforms, gameGenres, gameTags,
  gameEntries, gameRatings, codexEntries
} from './schema';

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed platforms
    console.log('📱 Seeding platforms...');
    const platformsData = [
      {
        name: 'Steam',
        slug: 'steam',
        short_name: 'Steam',
        icon: 'steam',
        color: '#1b2838',
        category: 'pc' as const,
        manufacturer: 'Valve Corporation',
        is_active: true
      },
      {
        name: 'PlayStation 5',
        slug: 'playstation-5',
        short_name: 'PS5',
        icon: 'playstation',
        color: '#003087',
        category: 'console' as const,
        manufacturer: 'Sony Interactive Entertainment',
        is_active: true
      },
      {
        name: 'Xbox Series X/S',
        slug: 'xbox-series-x-s',
        short_name: 'Xbox',
        icon: 'xbox',
        color: '#107c10',
        category: 'console' as const,
        manufacturer: 'Microsoft',
        is_active: true
      },
      {
        name: 'Nintendo Switch',
        slug: 'nintendo-switch',
        short_name: 'Switch',
        icon: 'nintendo',
        color: '#e60012',
        category: 'handheld' as const,
        manufacturer: 'Nintendo',
        is_active: true
      },
      {
        name: 'Epic Games Store',
        slug: 'epic-games',
        short_name: 'Epic',
        icon: 'epic',
        color: '#313131',
        category: 'pc' as const,
        manufacturer: 'Epic Games',
        is_active: true
      },
      {
        name: 'GOG',
        slug: 'gog',
        short_name: 'GOG',
        icon: 'gog',
        color: '#86328a',
        category: 'pc' as const,
        manufacturer: 'CD Projekt',
        is_active: true
      }
    ];

    await db.insert(platforms).values(platformsData);

    // Seed genres
    console.log('🎮 Seeding genres...');
    const genresData = [
      { name: 'Action', slug: 'action', color: '#ef4444', icon: 'zap' },
      { name: 'Adventure', slug: 'adventure', color: '#10b981', icon: 'map' },
      { name: 'RPG', slug: 'rpg', color: '#8b5cf6', icon: 'sword' },
      { name: 'Strategy', slug: 'strategy', color: '#3b82f6', icon: 'chess' },
      { name: 'Simulation', slug: 'simulation', color: '#f59e0b', icon: 'settings' },
      { name: 'Sports', slug: 'sports', color: '#06b6d4', icon: 'trophy' },
      { name: 'Racing', slug: 'racing', color: '#f97316', icon: 'car' },
      { name: 'Puzzle', slug: 'puzzle', color: '#84cc16', icon: 'puzzle' },
      { name: 'Horror', slug: 'horror', color: '#dc2626', icon: 'ghost' },
      { name: 'Indie', slug: 'indie', color: '#a855f7', icon: 'heart' }
    ];

    await db.insert(genres).values(genresData);

    // Seed tags
    console.log('🏷️ Seeding tags...');
    const tagsData = [
      // Mood tags
      { name: 'Relaxing', slug: 'relaxing', category: 'mood' as const, color: '#10b981' },
      { name: 'Intense', slug: 'intense', category: 'mood' as const, color: '#ef4444' },
      { name: 'Atmospheric', slug: 'atmospheric', category: 'mood' as const, color: '#6366f1' },
      { name: 'Funny', slug: 'funny', category: 'mood' as const, color: '#f59e0b' },
      
      // Mechanic tags
      { name: 'Turn-Based', slug: 'turn-based', category: 'mechanic' as const, color: '#3b82f6' },
      { name: 'Real-Time', slug: 'real-time', category: 'mechanic' as const, color: '#ef4444' },
      { name: 'Open World', slug: 'open-world', category: 'mechanic' as const, color: '#10b981' },
      { name: 'Linear', slug: 'linear', category: 'mechanic' as const, color: '#8b5cf6' },
      
      // Multiplayer tags
      { name: 'Single Player', slug: 'single-player', category: 'multiplayer' as const, color: '#6b7280' },
      { name: 'Co-op', slug: 'co-op', category: 'multiplayer' as const, color: '#10b981' },
      { name: 'Competitive', slug: 'competitive', category: 'multiplayer' as const, color: '#ef4444' },
      { name: 'MMO', slug: 'mmo', category: 'multiplayer' as const, color: '#8b5cf6' },
      
      // Length tags
      { name: 'Short (< 5h)', slug: 'short', category: 'length' as const, color: '#84cc16' },
      { name: 'Medium (5-20h)', slug: 'medium', category: 'length' as const, color: '#f59e0b' },
      { name: 'Long (20-50h)', slug: 'long', category: 'length' as const, color: '#ef4444' },
      { name: 'Very Long (50h+)', slug: 'very-long', category: 'length' as const, color: '#dc2626' },
      
      // Difficulty tags
      { name: 'Easy', slug: 'easy', category: 'difficulty' as const, color: '#10b981' },
      { name: 'Normal', slug: 'normal', category: 'difficulty' as const, color: '#f59e0b' },
      { name: 'Hard', slug: 'hard', category: 'difficulty' as const, color: '#ef4444' },
      { name: 'Souls-like', slug: 'souls-like', category: 'difficulty' as const, color: '#dc2626' }
    ];

    await db.insert(tags).values(tagsData);

    // Seed sample games
    console.log('🎯 Seeding sample games...');
    const gamesData = [
      {
        title: 'The Legend of Zelda: Breath of the Wild',
        slug: 'zelda-breath-of-the-wild',
        description: 'An open-world action-adventure game that redefines the Zelda series.',
        short_description: 'Open-world adventure in Hyrule',
        release_date: '2017-03-03',
        developer: 'Nintendo EPD',
        publisher: 'Nintendo',
        cover_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
        metacritic_score: 97,
        estimated_playtime: 3600, // 60 hours in minutes
        difficulty_level: 'medium' as const
      },
      {
        title: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        description: 'An open-world, action-adventure story set in Night City.',
        short_description: 'Futuristic RPG in Night City',
        release_date: '2020-12-10',
        developer: 'CD Projekt Red',
        publisher: 'CD Projekt',
        cover_image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=400',
        metacritic_score: 86,
        estimated_playtime: 3000, // 50 hours in minutes
        difficulty_level: 'medium' as const
      },
      {
        title: 'Hades',
        slug: 'hades',
        description: 'A rogue-like dungeon crawler from the creators of Bastion and Transistor.',
        short_description: 'Rogue-like dungeon crawler',
        release_date: '2020-09-17',
        developer: 'Supergiant Games',
        publisher: 'Supergiant Games',
        cover_image: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=400',
        metacritic_score: 93,
        estimated_playtime: 1800, // 30 hours in minutes
        difficulty_level: 'hard' as const
      }
    ];

    await db.insert(games).values(gamesData);

    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seed completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };