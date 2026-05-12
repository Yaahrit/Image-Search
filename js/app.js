/* ============================================================
   VISION IMAGE SEARCH — Consolidated App Script
   This version is "Bundled" to work without a local server.
   ============================================================ */

(function() {
  // 1. CONFIGURATION
  const CONFIG = {
    API_KEY: 'mmuZ9fGyfmV4D3WXPAT1f_pnRNV34rl2YxhiUOwgrgs',
    BASE_URL: 'https://api.unsplash.com',
    PER_PAGE: 20,
    MAX_RETRIES: 3,
    DEBOUNCE_DELAY: 500,
    STORAGE_KEYS: {
      THEME: 'img_search_theme',
      RECENT_SEARCHES: 'img_search_recent',
      FAVORITES: 'img_search_favs',
      LANGUAGE: 'img_search_lang'
    },
    CATEGORIES: ['Nature', 'Architecture', 'Travel', 'Fashion', 'Technology', 'People', 'Animals', 'Food', 'Spirituality', 'Business'],
    HERO_CATEGORIES: ['wallpapers', 'nature', 'architecture', 'textures-patterns']
  };

  // 2. UTILITIES
  const utils = {
    debounce: (fn, delay) => {
      let timeoutId;
      return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    },
    formatNumber: (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num;
    },
    copyToClipboard: async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Failed to copy: ', err);
        return false;
      }
    },
    downloadImage: async (url, filename) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'unsplash-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return true;
      } catch (error) {
        console.error('Download failed:', error);
        return false;
      }
    }
  };

  // 3. API SERVICE
  const api = {
    async fetch(endpoint, params = {}, retries = CONFIG.MAX_RETRIES) {
      const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
      url.searchParams.append('client_id', CONFIG.API_KEY);
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1000));
          return this.fetch(endpoint, params, retries - 1);
        }
        throw error;
      }
    },
    searchPhotos: (query, page = 1, filters = {}) => api.fetch('/search/photos', { query, page, per_page: CONFIG.PER_PAGE, ...filters }),
    getRandomPhotos: (count = 1, query = '') => api.fetch('/photos/random', { count, query }),
    getPhotoById: (id) => api.fetch(`/photos/${id}`),
    listPhotos: (page = 1, orderBy = 'latest') => api.fetch('/photos', { page, per_page: CONFIG.PER_PAGE, order_by: orderBy })
  };

  // 4. UI CONTROLLER
  const ui = {
    resultsGrid: null,
    toastContainer: null,
    loader: null,
    
    init() {
      this.resultsGrid = document.getElementById('search-result');
      this.toastContainer = document.getElementById('toast-container');
      this.loader = document.getElementById('page-loader');
    },

    createImageCard(data) {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.dataset.id = data.id;
      const aspectRatio = data.height / data.width;
      card.innerHTML = `
        <img src="${data.urls.small}" alt="${data.alt_description || 'Unsplash Image'}" loading="lazy" style="aspect-ratio: ${1/aspectRatio}">
        <div class="card-overlay">
          <div class="card-top-actions">
            <button class="card-action-btn like-btn" title="Save to favorites"><i class="far fa-heart"></i></button>
            <button class="card-action-btn share-btn" title="Share image"><i class="fas fa-share-alt"></i></button>
          </div>
          <div class="card-bottom-info">
            <a href="${data.user.links.html}" target="_blank" class="photographer">
              <img src="${data.user.profile_image.small}" alt="${data.user.name}" class="photographer-img">
              <span class="photographer-name">${data.user.name}</span>
            </a>
            <button class="card-action-btn download-btn" title="Download"><i class="fas fa-download"></i></button>
          </div>
        </div>`;
      return card;
    },

    renderImages(images, append = false) {
      if (!append) this.resultsGrid.innerHTML = '';
      const fragment = document.createDocumentFragment();
      images.forEach(img => fragment.appendChild(this.createImageCard(img)));
      this.resultsGrid.appendChild(fragment);
    },

    showSkeletons(count = 12) {
      for(let i=0; i<count; i++) {
        const s = document.createElement('div');
        s.className = 'skeleton skeleton-card';
        this.resultsGrid.appendChild(s);
      }
    },

    removeSkeletons() {
      this.resultsGrid.querySelectorAll('.skeleton').forEach(s => s.remove());
    },

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
      toast.innerHTML = `<i class="fas fa-${icon} toast-icon"></i><span class="toast-message">${message}</span>`;
      this.toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.animation = 'toastExit 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    },

    showEmptyState(type = 'no-results') {
      this.resultsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-${type === 'no-results' ? 'search' : 'image'}"></i>
          <h3>${type === 'no-results' ? 'No results found' : 'Start searching...'}</h3>
          <p>Try different keywords or filters.</p>
        </div>`;
    },

    setPageLoader(visible) {
      if (this.loader) this.loader.classList.toggle('hidden', !visible);
    },

    updateHeroBG(url) {
      const hero = document.getElementById('hero');
      if (hero) hero.style.backgroundImage = `url(${url})`;
    }
  };

  // 5. TRANSLATIONS
  const i18n = {
    currentLang: 'en',
    data: {
      en: { hero_title: 'Capture Your <span class="text-gradient">Vision</span>', hero_subtitle: 'Discover over 3 million high-quality images.', search_placeholder: 'Search for high-resolution images...', filters_orientation: 'Orientation', filters_sort: 'Sort By', history_title: 'Search History' },
      hi: { hero_title: 'अपनी <span class="text-gradient">दृष्टि</span> को कैद करें', hero_subtitle: '3 मिलियन से अधिक उच्च गुणवत्ता वाली छवियों की खोज करें।', search_placeholder: 'उच्च-रिज़ॉल्यूशन छवियों के लिए खोजें...', filters_orientation: 'अभिविन्यास', filters_sort: 'क्रमबद्ध करें', history_title: 'खोज इतिहास' }
    },
    init() {
      this.currentLang = localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE) || 'en';
      this.apply();
    },
    set(lang) {
      this.currentLang = lang;
      localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
      this.apply();
    },
    apply() {
      const t = this.data[this.currentLang] || this.data.en;
      document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.dataset.t;
        if (t[key]) el.tagName === 'INPUT' ? el.placeholder = t[key] : el.innerHTML = t[key];
      });
      document.documentElement.lang = this.currentLang;
    }
  };

  // 6. MODULES (State Management)
  const state = {
    search: {
      query: '', page: 1, loading: false, hasMore: true, history: []
    },
    filters: {
      orientation: '', color: '', order_by: 'relevant'
    },
    favorites: []
  };

  // 7. CORE LOGIC
  const core = {
    async search(query, isNew = true) {
      if (!query || state.search.loading) return;
      if (isNew) {
        state.search.query = query;
        state.search.page = 1;
        state.search.hasMore = true;
        ui.renderImages([], false);
        ui.showSkeletons(12);
        this.addToHistory(query);
      }
      state.search.loading = true;
      try {
        const data = await api.searchPhotos(query, state.search.page, state.filters);
        ui.removeSkeletons();
        if (data.results.length === 0 && isNew) {
          ui.showEmptyState('no-results');
          state.search.hasMore = false;
        } else {
          ui.renderImages(data.results, !isNew);
          state.search.hasMore = state.search.page < data.total_pages;
        }
        state.search.page++;
      } catch (e) {
        ui.removeSkeletons();
        ui.showToast(e.message, 'error');
      } finally {
        state.search.loading = false;
      }
    },

    addToHistory(query) {
      state.search.history = [query, ...state.search.history.filter(s => s !== query)].slice(0, 20);
      localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(state.search.history));
      this.updateHistoryUI();
    },

    updateHistoryUI() {
      const list = document.getElementById('history-list');
      if (!list) return;
      list.innerHTML = state.search.history.map(term => `
        <div class="history-item" data-term="${term}">
          <div class="history-item-text"><i class="fas fa-history"></i><span>${term}</span></div>
          <button class="btn-ghost btn-icon remove-history" data-term="${term}"><i class="fas fa-times"></i></button>
        </div>`).join('') || '<p>No history</p>';
    },

    toggleFavorite(data) {
      const idx = state.favorites.findIndex(f => f.id === data.id);
      if (idx === -1) {
        state.favorites.unshift(data);
        ui.showToast('Added to favorites', 'success');
      } else {
        state.favorites.splice(idx, 1);
        ui.showToast('Removed from favorites', 'info');
      }
      localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
      this.updateCardFavState(data.id);
    },

    updateCardFavState(id) {
      const card = document.querySelector(`.image-card[data-id="${id}"]`);
      if (card) {
        const btn = card.querySelector('.like-btn');
        const isFav = state.favorites.some(f => f.id === id);
        btn.classList.toggle('liked', isFav);
        btn.querySelector('i').className = isFav ? 'fas fa-heart' : 'far fa-heart';
      }
    }
  };

  // 8. THEME & APP INIT
  const app = {
    init() {
      ui.init();
      i18n.init();
      
      // Load stored state
      state.search.history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES) || '[]');
      state.favorites = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES) || '[]');
      
      const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      
      this.setupListeners();
      this.loadInitial();
      
      setTimeout(() => ui.setPageLoader(false), 800);
    },

    setupListeners() {
      // Search
      document.getElementById('search-form').onsubmit = (e) => {
        e.preventDefault();
        core.search(document.getElementById('search-box').value);
      };

      // Theme
      document.getElementById('theme-toggle-btn').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, next);
        document.querySelector('.theme-toggle-dot i').className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      };

      // Nav
      document.getElementById('nav-favs').onclick = () => {
        ui.renderImages(state.favorites, false);
        state.favorites.forEach(f => core.updateCardFavState(f.id));
      };

      document.getElementById('nav-history').onclick = () => {
        core.updateHistoryUI();
        document.getElementById('sidebar').classList.add('open');
      };

      document.getElementById('sidebar-close').onclick = () => document.getElementById('sidebar').classList.remove('open');

      // Grid Actions
      document.getElementById('search-result').onclick = async (e) => {
        const card = e.target.closest('.image-card');
        if (!card) return;
        const id = card.dataset.id;
        
        if (e.target.closest('.like-btn')) {
          e.stopPropagation();
          core.toggleFavorite({ id, urls: { small: card.querySelector('img').src }, user: { name: card.querySelector('.photographer-name').textContent, links: { html: card.querySelector('.photographer').href }, profile_image: { small: card.querySelector('.photographer-img').src } }, height: 100, width: 100 });
        } else if (e.target.closest('.download-btn')) {
          e.stopPropagation();
          const data = await api.getPhotoById(id);
          utils.downloadImage(data.urls.full, `unsplash-${id}.jpg`);
        } else {
          // Open details (simplified for bundled version)
          const data = await api.getPhotoById(id);
          ui.showToast(`Photo by ${data.user.name}`, 'info');
        }
      };

      // Infinite Scroll
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && state.search.hasMore && state.search.query) {
          core.search(state.search.query, false);
        }
      }, { rootMargin: '200px' });
      observer.observe(document.getElementById('infinite-scroll-sentinel'));

      // Category Chips
      const chips = document.getElementById('category-chips');
      chips.innerHTML = CONFIG.CATEGORIES.map(c => `<button class="category-pill" data-cat="${c}">${c}</button>`).join('');
      chips.onclick = (e) => {
        const cat = e.target.dataset.cat;
        if (cat) {
          document.getElementById('search-box').value = cat;
          core.search(cat);
        }
      };
    },

    async loadInitial() {
      ui.showSkeletons(12);
      const data = await api.listPhotos(1, 'latest');
      ui.removeSkeletons();
      ui.renderImages(data);
      data.forEach(img => {
        if (state.favorites.some(f => f.id === img.id)) core.updateCardFavState(img.id);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => app.init());
})();
