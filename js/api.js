/* ============================================================
   API SERVICE — Unsplash API Wrapper
   ============================================================ */

import CONFIG from './config.js';

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.accessKey = CONFIG.API_KEY;
  }

  /**
   * Helper to build request headers
   */
  get headers() {
    return {
      'Authorization': `Client-ID ${this.accessKey}`,
      'Accept-Version': 'v1'
    };
  }

  /**
   * Generic fetch wrapper with retry logic
   */
  async _fetch(endpoint, params = {}, retries = CONFIG.MAX_RETRIES) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: this.headers
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error('Rate limit exceeded');
        if (response.status === 401) throw new Error('Invalid API Key');
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (retries > 0) {
        // Simple exponential backoff: wait 1s, 2s, 4s...
        const wait = (CONFIG.MAX_RETRIES - retries + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, wait));
        return this._fetch(endpoint, params, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Search photos
   * @param {string} query 
   * @param {number} page 
   * @param {Object} filters 
   */
  async searchPhotos(query, page = 1, filters = {}) {
    const params = {
      query,
      page,
      per_page: CONFIG.PER_PAGE,
      ...filters
    };
    return this._fetch('/search/photos', params);
  }

  /**
   * Get random photos for hero background
   * @param {string} collection 
   */
  async getRandomPhotos(count = 1, query = '') {
    const params = {
      count,
      query
    };
    return this._fetch('/photos/random', params);
  }

  /**
   * Get photo details by ID
   * @param {string} id 
   */
  async getPhotoById(id) {
    return this._fetch(`/photos/${id}`);
  }

  /**
   * List photos (trending/latest)
   */
  async listPhotos(page = 1, orderBy = 'latest') {
    return this._fetch('/photos', {
      page,
      per_page: CONFIG.PER_PAGE,
      order_by: orderBy
    });
  }
}

export const api = new ApiService();
