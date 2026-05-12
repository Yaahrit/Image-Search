/* ============================================================
   SHORTCUTS MODULE — Keyboard Shortcuts Management
   ============================================================ */

import { themeModule } from './theme.js';
import { ui } from './ui.js';

class ShortcutsModule {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    // Skip if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    // Shortcuts
    switch (e.key.toLowerCase()) {
      case '/':
      case 'k':
        if (e.ctrlKey || e.metaKey || e.key === '/') {
          e.preventDefault();
          document.getElementById('search-box').focus();
        }
        break;

      case 't':
        themeModule.toggle();
        ui.showToast(`Theme switched to ${themeModule.currentTheme}`, 'info');
        break;

      case 'f':
        document.getElementById('nav-favs').click();
        break;

      case 'h':
        document.getElementById('nav-history').click();
        break;

      case 'escape':
        // Close modal or sidebar if open
        const modal = document.getElementById('image-modal');
        const sidebar = document.getElementById('sidebar');
        if (modal.classList.contains('active')) {
          document.querySelector('.modal-close').click();
        }
        if (sidebar.classList.contains('open')) {
          document.getElementById('sidebar-close').click();
        }
        break;

      case '?':
        this.showShortcutsHelp();
        break;
    }
  }

  showShortcutsHelp() {
    ui.showToast('Shortcuts: [K/ /] Search, [T] Theme, [F] Favorites, [H] History, [?] Help', 'info');
  }
}

export const shortcuts = new ShortcutsModule();
