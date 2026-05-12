/* ============================================================
   UI CONTROLLER — DOM Rendering & Component Factory
   ============================================================ */

import { formatNumber } from './utils.js';

class UIController {
  constructor() {
    this.resultsGrid = document.getElementById('search-result');
    this.toastContainer = document.getElementById('toast-container');
    this.loader = document.getElementById('page-loader');
  }

  /**
   * Create an image card element
   * @param {Object} data - Unsplash image data
   */
  createImageCard(data) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.id = data.id;
    
    // Calculate aspect ratio for masonry
    const aspectRatio = data.height / data.width;
    
    card.innerHTML = `
      <img src="${data.urls.small}" 
           alt="${data.alt_description || 'Unsplash Image'}" 
           loading="lazy"
           style="aspect-ratio: ${1/aspectRatio}">
      <div class="card-overlay">
        <div class="card-top-actions">
          <button class="card-action-btn like-btn" title="Save to favorites">
            <i class="far fa-heart"></i>
          </button>
          <button class="card-action-btn share-btn" title="Share image">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
        <div class="card-bottom-info">
          <a href="${data.user.links.html}" target="_blank" class="photographer">
            <img src="${data.user.profile_image.small}" alt="${data.user.name}" class="photographer-img">
            <span class="photographer-name">${data.user.name}</span>
          </a>
          <button class="card-action-btn download-btn" title="Download">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  /**
   * Render images to the grid
   * @param {Array} images 
   * @param {boolean} append 
   */
  renderImages(images, append = false) {
    if (!append) this.resultsGrid.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    images.forEach(img => {
      const card = this.createImageCard(img);
      fragment.appendChild(card);
    });
    
    this.resultsGrid.appendChild(fragment);
  }

  /**
   * Show skeleton loaders
   * @param {number} count 
   */
  showSkeletons(count = 12) {
    const skeletons = Array(count).fill(0).map(() => {
      const s = document.createElement('div');
      s.className = 'skeleton skeleton-card';
      return s;
    });
    
    skeletons.forEach(s => this.resultsGrid.appendChild(s));
  }

  /**
   * Remove skeleton loaders
   */
  removeSkeletons() {
    const skeletons = this.resultsGrid.querySelectorAll('.skeleton');
    skeletons.forEach(s => s.remove());
  }

  /**
   * Show toast notification
   * @param {string} message 
   * @param {string} type - success, error, info
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
      <i class="fas fa-${icon} toast-icon"></i>
      <span class="toast-message">${message}</span>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Auto remove after 3s
    setTimeout(() => {
      toast.style.animation = 'toastExit 0.4s forwards';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  /**
   * Show empty state
   * @param {string} type - 'no-results' or 'initial'
   */
  showEmptyState(type = 'no-results') {
    this.resultsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-${type === 'no-results' ? 'search' : 'image'}"></i>
        <h3>${type === 'no-results' ? 'No results found' : 'Start searching...'}</h3>
        <p>${type === 'no-results' ? 'Try different keywords or filters.' : 'Explore millions of high-quality images.'}</p>
      </div>
    `;
  }

  /**
   * Show/Hide page loader
   */
  setPageLoader(visible) {
    if (visible) {
      this.loader.classList.remove('hidden');
    } else {
      this.loader.classList.add('hidden');
    }
  }

  /**
   * Update hero background
   * @param {string} url 
   */
  updateHeroBG(url) {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.style.backgroundImage = `url(${url})`;
    }
  }
}

export const ui = new UIController();
