<script lang="ts">
  import Icon from '@iconify/svelte';
  
  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'API', href: '/api' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Changelog', href: '/changelog' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Status', href: '/status' },
      { name: 'Feedback', href: '/feedback' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'DMCA', href: '/dmca' }
    ]
  };
  
  const socialLinks = [
    { name: 'Twitter', href: '#', icon: 'lucide:twitter' },
    { name: 'Discord', href: '#', icon: 'lucide:message-circle' },
    { name: 'GitHub', href: '#', icon: 'lucide:github' },
    { name: 'Reddit', href: '#', icon: 'lucide:reddit' }
  ];
</script>

<footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
  <div class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
      <!-- Brand -->
      <div class="lg:col-span-2">
        <a href="/" class="flex items-center space-x-2 font-bold text-xl text-primary-600 mb-4">
          <Icon icon="lucide:gamepad-2" class="w-8 h-8" />
          <span>GameHub</span>
        </a>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
          Discover, track, and explore your favorite games. Join millions of gamers in the ultimate gaming discovery platform.
        </p>
        <div class="flex space-x-4">
          {#each socialLinks as social}
            <a
              href={social.href}
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={social.name}
            >
              <Icon icon={social.icon} class="w-5 h-5" />
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Links -->
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h3>
        <ul class="space-y-2">
          {#each footerLinks.product as link}
            <li>
              <a href={link.href} class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
        <ul class="space-y-2">
          {#each footerLinks.company as link}
            <li>
              <a href={link.href} class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h3>
        <ul class="space-y-2">
          {#each footerLinks.support as link}
            <li>
              <a href={link.href} class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
        <ul class="space-y-2">
          {#each footerLinks.legal as link}
            <li>
              <a href={link.href} class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    
    <div class="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        © 2024 GameHub. All rights reserved.
      </p>
      <p class="text-gray-600 dark:text-gray-400 text-sm mt-4 md:mt-0">
        Made with ❤️ for gamers worldwide
      </p>
    </div>
  </div>
</footer>