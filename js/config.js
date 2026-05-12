/* ============================================================
   CONFIGURATION — API Keys, Constants, and Settings
   ============================================================ */

const CONFIG = {
  // Unsplash API Settings
  API_KEY: 'mmuZ9fGyfmV4D3WXPAT1f_pnRNV34rl2YxhiUOwgrgs',
  BASE_URL: 'https://api.unsplash.com',
  
  // Search Settings
  PER_PAGE: 20,
  MAX_RETRIES: 3,
  DEBOUNCE_DELAY: 500,
  
  // Storage Keys
  STORAGE_KEYS: {
    THEME: 'img_search_theme',
    RECENT_SEARCHES: 'img_search_recent',
    FAVORITES: 'img_search_favs',
    LANGUAGE: 'img_search_lang'
  },
  
  // Default Categories for quick chips
  CATEGORIES: [
    'Nature', 'Architecture', 'Travel', 'Fashion', 
    'Technology', 'People', 'Animals', 'Food', 
    'Spirituality', 'Business'
  ],
  
  // Hero Background Rotation (featured categories)
  HERO_CATEGORIES: [
    'wallpapers', 'nature', 'architecture', 'textures-patterns'
  ],
  
  // Localization (i18n)
  LANGUAGES: {
    EN: 'English',
    HI: 'Hindi',
    ES: 'Spanish',
    FR: 'French'
  }
};

export default CONFIG;
