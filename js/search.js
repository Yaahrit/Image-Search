/* ============================================================
   SEARCH MODULE — Search Logic, History, and Suggestions
   ============================================================ */

import { api } from './api.js';
import { ui } from './ui.js';
import CONFIG from './config.js';

class SearchModule {
  constructor() {
    this.currentQuery = '';
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.recentSearches = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES) || '[]');
    
    this.setupInfiniteScroll();
  }

  /**
   * Perform search
   * @param {string} query 
   * @param {boolean} isNewSearch 
   * @param {Object} filters 
   */
  async search(query, isNewSearch = true, filters = {}) {
    if (!query) return;
    if (this.isLoading) return;

    if (isNewSearch) {
      this.currentQuery = query;
      this.currentPage = 1;
      this.hasMore = true;
      ui.renderImages([], false); // Clear current
      ui.showSkeletons(12);
      this.addToHistory(query);
    }

    this.isLoading = true;

    try {
      const data = await api.searchPhotos(query, this.currentPage, filters);
      
      ui.removeSkeletons();

      if (data.results.length === 0 && isNewSearch) {
        ui.showEmptyState('no-results');
        this.hasMore = false;
      } else {
        ui.renderImages(data.results, !isNewSearch);
        this.hasMore = this.currentPage < data.total_pages;
      }

      this.currentPage++;
    } catch (error) {
      ui.removeSkeletons();
      ui.showToast(error.message, 'error');
      console.error('Search error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add query to history
   */
  addToHistory(query) {
    if (!query.trim()) return;
    
    this.recentSearches = [
      query,
      ...this.recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
    ].slice(0, 20);
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(this.recentSearches));
    this.updateHistoryUI();
  }

  /**
   * Update the history sidebar UI
   */
  updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (this.recentSearches.length === 0) {
      historyList.innerHTML = '<p class="text-tertiary text-sm">No recent searches</p>';
      return;
    }

    historyList.innerHTML = this.recentSearches.map(term => `
      <div class="history-item" data-term="${term}">
        <div class="history-item-text">
          <i class="fas fa-history"></i>
          <span>${term}</span>
        </div>
        <button class="btn-ghost btn-icon remove-history" data-term="${term}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }

  /**
   * Setup infinite scroll observer
   */
  setupInfiniteScroll() {
    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isLoading && this.hasMore && this.currentQuery) {
        this.search(this.currentQuery, false);
      }
    }, {
      rootMargin: '200px'
    });

    observer.observe(sentinel);
  }
}

export const searchModule = new SearchModule();
