/* ============================================================
   FILTERS MODULE — Orientation, Color, and Sort Filters
   ============================================================ */

class FilterModule {
  constructor() {
    this.activeFilters = {
      orientation: '',
      color: '',
      order_by: 'relevant'
    };
  }

  /**
   * Set a filter value
   * @param {string} key - orientation, color, order_by
   * @param {string} value 
   */
  setFilter(key, value) {
    if (this.activeFilters[key] === value) {
      this.activeFilters[key] = ''; // Toggle off
    } else {
      this.activeFilters[key] = value;
    }
    
    this.updateUI();
    return this.activeFilters;
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.activeFilters = {
      orientation: '',
      color: '',
      order_by: 'relevant'
    };
    this.updateUI();
    return this.activeFilters;
  }

  /**
   * Update filter UI elements
   */
  updateUI() {
    // Orientation pills
    document.querySelectorAll('.filter-pill[data-filter="orientation"]').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.value === this.activeFilters.orientation);
    });

    // Color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.classList.toggle('active', swatch.dataset.value === this.activeFilters.color);
    });

    // Order by
    const orderBySelect = document.getElementById('order-by');
    if (orderBySelect) orderBySelect.value = this.activeFilters.order_by;
  }
}

export const filterModule = new FilterModule();
