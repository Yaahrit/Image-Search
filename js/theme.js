/* ============================================================
   THEME MODULE — Dark & Light Mode Management
   ============================================================ */

import CONFIG from './config.js';
import { getThemePreference } from './utils.js';

class ThemeModule {
  constructor() {
    this.currentTheme = getThemePreference(CONFIG.STORAGE_KEYS.THEME);
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
  }

  /**
   * Toggle between dark and light themes
   */
  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, this.currentTheme);
  }

  /**
   * Apply the theme to the document
   * @param {string} theme 
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateToggleUI(theme);
  }

  /**
   * Update the toggle switch UI
   */
  updateToggleUI(theme) {
    const dot = document.querySelector('.theme-toggle-dot i');
    if (dot) {
      dot.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }
}

export const themeModule = new ThemeModule();
