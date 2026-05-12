/* ============================================================
   I18N MODULE — Multi-language Support
   ============================================================ */

import CONFIG from './config.js';

const TRANSLATIONS = {
  en: {
    hero_title: 'Capture Your <span class="text-gradient">Vision</span>',
    hero_subtitle: 'Discover over 3 million high-quality images from the world\'s most generous community of photographers.',
    search_placeholder: 'Search for high-resolution images...',
    filters_orientation: 'Orientation',
    filters_color: 'Color',
    filters_sort: 'Sort By',
    trending_searches: 'Trending Searches',
    history_title: 'Search History',
    no_results: 'No results found',
    start_searching: 'Start searching...'
  },
  hi: {
    hero_title: 'अपनी <span class="text-gradient">दृष्टि</span> को कैद करें',
    hero_subtitle: 'दुनिया के सबसे उदार फोटोग्राफरों के समुदाय से 3 मिलियन से अधिक उच्च गुणवत्ता वाली छवियों की खोज करें।',
    search_placeholder: 'उच्च-रिज़ॉल्यूशन छवियों के लिए खोजें...',
    filters_orientation: 'अभिविन्यास',
    filters_color: 'रंग',
    filters_sort: 'क्रमबद्ध करें',
    trending_searches: 'रुझान वाली खोजें',
    history_title: 'खोज इतिहास',
    no_results: 'कोई परिणाम नहीं मिला',
    start_searching: 'खोजना शुरू करें...'
  },
  es: {
    hero_title: 'Captura Tu <span class="text-gradient">Visión</span>',
    hero_subtitle: 'Descubre más de 3 millones de imágenes de alta calidad de la comunidad de fotógrafos más generosa del mundo.',
    search_placeholder: 'Buscar imágenes de alta resolución...',
    filters_orientation: 'Orientación',
    filters_color: 'Color',
    filters_sort: 'Ordenar por',
    trending_searches: 'Búsquedas de tendencia',
    history_title: 'Historial de búsqueda',
    no_results: 'No se encontraron resultados',
    start_searching: 'Empieza a buscar...'
  },
  fr: {
    hero_title: 'Capturez Votre <span class="text-gradient">Vision</span>',
    hero_subtitle: 'Découvrez plus de 3 millions d\'images de haute qualité de la communauté de photographes la plus généreuse au monde.',
    search_placeholder: 'Rechercher des images haute résolution...',
    filters_orientation: 'Orientation',
    filters_color: 'Couleur',
    filters_sort: 'Trier par',
    trending_searches: 'Recherches tendances',
    history_title: 'Historique de recherche',
    no_results: 'Aucun résultat trouvé',
    start_searching: 'Commencez à chercher...'
  }
};

class I18nModule {
  constructor() {
    this.currentLang = localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE) || 'en';
    this.init();
  }

  init() {
    this.applyTranslations(this.currentLang);
  }

  /**
   * Set the application language
   * @param {string} lang 
   */
  setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
      this.applyTranslations(lang);
      localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
    }
  }

  /**
   * Apply translations to the DOM
   */
  applyTranslations(lang) {
    const t = TRANSLATIONS[lang];
    
    // Update elements with data-t attribute
    document.querySelectorAll('[data-t]').forEach(el => {
      const key = el.dataset.t;
      if (t[key]) {
        if (el.tagName === 'INPUT') {
          el.placeholder = t[key];
        } else {
          el.innerHTML = t[key];
        }
      }
    });

    // Update lang attribute
    document.documentElement.lang = lang;
  }

  /**
   * Translate a key (for use in JS)
   */
  t(key) {
    return TRANSLATIONS[this.currentLang][key] || key;
  }
}

export const i18n = new I18nModule();
