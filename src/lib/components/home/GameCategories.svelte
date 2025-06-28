<script lang="ts">
  import Icon from '@iconify/svelte';
  
  const categories = [
    {
      name: 'Action',
      slug: 'action',
      icon: 'lucide:zap',
      color: 'from-red-500 to-orange-500',
      description: 'Fast-paced games with intense combat',
      gameCount: '12,450'
    },
    {
      name: 'RPG',
      slug: 'role-playing-games-rpg',
      icon: 'lucide:sword',
      color: 'from-purple-500 to-pink-500',
      description: 'Immersive role-playing experiences',
      gameCount: '8,320'
    },
    {
      name: 'Strategy',
      slug: 'strategy',
      icon: 'lucide:chess',
      color: 'from-blue-500 to-cyan-500',
      description: 'Think, plan, and conquer',
      gameCount: '5,670'
    },
    {
      name: 'Adventure',
      slug: 'adventure',
      icon: 'lucide:map',
      color: 'from-green-500 to-emerald-500',
      description: 'Explore vast worlds and stories',
      gameCount: '9,840'
    },
    {
      name: 'Simulation',
      slug: 'simulation',
      icon: 'lucide:settings',
      color: 'from-yellow-500 to-orange-500',
      description: 'Realistic life and world simulations',
      gameCount: '4,230'
    },
    {
      name: 'Sports',
      slug: 'sports',
      icon: 'lucide:trophy',
      color: 'from-indigo-500 to-purple-500',
      description: 'Competitive sports gaming',
      gameCount: '3,560'
    }
  ];
</script>

<section class="py-16">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Browse by Category
      </h2>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Discover games across different genres and find your perfect match
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each categories as category}
        <a
          href="/games?genres={category.slug}"
          class="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Background Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br {category.color} opacity-5 group-hover:opacity-10 transition-opacity"></div>
          
          <div class="relative p-6">
            <!-- Icon -->
            <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br {category.color} rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Icon icon={category.icon} class="w-6 h-6 text-white" />
            </div>
            
            <!-- Content -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:{category.color} transition-all">
              {category.name}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {category.description}
            </p>
            
            <!-- Stats -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {category.gameCount} games
              </span>
              <Icon icon="lucide:arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </a>
      {/each}
    </div>
    
    <!-- View All Categories -->
    <div class="text-center mt-12">
      <a href="/categories" class="btn-secondary">
        <Icon icon="lucide:grid-3x3" class="w-4 h-4 mr-2" />
        View All Categories
      </a>
    </div>
  </div>
</section>