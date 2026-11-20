import { initTheme, initNav, initBackToTop } from './core.js';
import { initSearch } from './search.js';
import { initDailyQuote, initQuotePage } from './quotes.js';
import { initArticlePage, initScrollUI, initTocSpy } from './article.js';
import { initFilters } from './filters.js';
import { initLibrary } from './library.js';

initTheme();
initNav();
initBackToTop();
initSearch();
initScrollUI();
initTocSpy();
initDailyQuote();
initQuotePage();
initArticlePage();
initFilters();
initLibrary();