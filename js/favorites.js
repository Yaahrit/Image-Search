/* ============================================================
   FAVORITES MODULE — Like, Save, and Manage Favorites
   ============================================================ */

import CONFIG from './config.js';
import { ui } from './ui.js';

class FavoritesModule {
  constructor() {
    this.favorites = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES) || '[]');
  }

  /**
   * Toggle favorite state for an image
   * @param {Object} imageData 
   */
  toggle(imageData) {
    const index = this.favorites.findIndex(fav => fav.id === imageData.id);
    let isLiked = false;

    if (index === -1) {
      this.favorites.unshift(imageData);
      isLiked = true;
      ui.showToast('Added to favorites', 'success');
    } else {
      this.favorites.splice(index, 1);
      isLiked = false;
      ui.showToast('Removed from favorites', 'info');
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
    this.updateCardUI(imageData.id, isLiked);
    return isLiked;
  }

  /**
   * Check if an image is favorited
   * @param {string} id 
   */
  isFavorite(id) {
    return this.favorites.some(fav => fav.id === id);
  }

  /**
   * Update the heart icon on a specific card
   */
  updateCardUI(id, isLiked) {
    const card = document.querySelector(`.image-card[data-id="${id}"]`);
    if (card) {
      const btn = card.querySelector('.like-btn');
      const icon = btn.querySelector('i');
      
      btn.classList.toggle('liked', isLiked);
      icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
      
      if (isLiked) {
        icon.style.animation = 'heartPop 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.49)';
        setTimeout(() => icon.style.animation = '', 400);
      }
    }
  }

  /**
   * View all favorites in the grid
   */
  viewFavorites() {
    if (this.favorites.length === 0) {
      ui.showEmptyState('initial');
      ui.showToast('You have no favorites yet', 'info');
      return;
    }

    ui.renderImages(this.favorites, false);
    // Add liked state to all rendered cards
    this.favorites.forEach(fav => this.updateCardUI(fav.id, true));
  }
}

export const favoritesModule = new FavoritesModule();
