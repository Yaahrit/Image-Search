/* ============================================================
   MODAL MODULE — Fullscreen Image Preview & Details
   ============================================================ */

import { api } from './api.js';
import { ui } from './ui.js';
import { copyToClipboard, downloadImage } from './utils.js';

class ModalModule {
  constructor() {
    this.modal = document.getElementById('image-modal');
    this.currentImageData = null;
  }

  /**
   * Open the modal with image details
   * @param {string} photoId 
   */
  async open(photoId) {
    if (!photoId) return;

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      // Fetch fresh details for the modal
      const data = await api.getPhotoById(photoId);
      this.currentImageData = data;
      this.renderModalContent(data);
    } catch (error) {
      console.error('Failed to load image details:', error);
      ui.showToast('Failed to load image details', 'error');
      this.close();
    }
  }

  /**
   * Render details into the modal
   */
  renderModalContent(data) {
    const container = document.getElementById('modal-body');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-image-container">
        <img src="${data.urls.regular}" alt="${data.alt_description || 'Preview'}">
      </div>
      <div class="modal-info-sidebar">
        <div class="photographer-header">
          <a href="${data.user.links.html}" target="_blank" class="photographer">
            <img src="${data.user.profile_image.medium}" alt="${data.user.name}" class="photographer-img">
            <div>
              <p class="photographer-name">${data.user.name}</p>
              <p class="text-xs text-tertiary">@${data.user.username}</p>
            </div>
          </a>
        </div>

        <div class="image-meta">
          <div class="meta-item">
            <span class="meta-label">Views</span>
            <span class="meta-value">${data.views.toLocaleString()}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Downloads</span>
            <span class="meta-value">${data.downloads.toLocaleString()}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Likes</span>
            <span class="meta-value">${data.likes.toLocaleString()}</span>
          </div>
        </div>

        ${data.description ? `<p class="image-description">${data.description}</p>` : ''}

        <div class="modal-actions">
          <button class="btn btn-primary btn-large w-full" id="modal-download">
            <i class="fas fa-download"></i> Download
          </button>
          <div class="flex gap-2">
            <button class="btn btn-secondary flex-1" id="modal-copy">
              <i class="fas fa-link"></i> Copy Link
            </button>
            <button class="btn btn-secondary flex-1" id="modal-share">
              <i class="fas fa-share-alt"></i> Share
            </button>
          </div>
        </div>

        <div class="image-details-list">
          <div class="detail-row">
            <span>Dimensions</span>
            <span>${data.width} × ${data.height}</span>
          </div>
          <div class="detail-row">
            <span>Published on</span>
            <span>${new Date(data.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;

    // Re-bind actions
    document.getElementById('modal-download').onclick = () => {
      downloadImage(data.urls.full, `unsplash-${data.id}.jpg`);
      ui.showToast('Starting download...', 'success');
    };

    document.getElementById('modal-copy').onclick = () => {
      copyToClipboard(data.links.html);
      ui.showToast('Link copied to clipboard!', 'success');
    };

    document.getElementById('modal-share').onclick = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Photo by ${data.user.name} on Unsplash`,
            url: data.links.html
          });
        } catch (err) {
          console.log('Share failed:', err);
        }
      } else {
        copyToClipboard(data.links.html);
        ui.showToast('Link copied to clipboard!', 'success');
      }
    };
  }

  /**
   * Close the modal
   */
  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.currentImageData = null;
  }
}

export const modalModule = new ModalModule();
