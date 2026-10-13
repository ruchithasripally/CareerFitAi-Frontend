/**
 * CareerFit AI - Frontend API Configuration
 *
 * Centralizes the Backend API Base URL across all pages.
 * Supports:
 *  1. Injected window.__API_BASE_URL__ (Vercel runtime script or meta tag)
 *  2. LocalStorage override (convenient for testing custom Render deployment URLs in browser)
 *  3. Fallback to local Spring Boot default: http://localhost:8080
 */

const CareerFitConfig = (function () {
  // Default development URL
  const DEFAULT_DEV_API_URL = 'http://localhost:8080';

  /**
   * Resolves the active backend API base URL.
   */
  function getApiBaseUrl() {
    // 1. Check if user configured a custom Render URL in localStorage
    const savedUrl = localStorage.getItem('careerfit_api_base_url');
    if (savedUrl && savedUrl.trim()) {
      return savedUrl.trim().replace(/\/+$/, '');
    }

    // 2. Check window runtime variable (e.g. from vercel environment injection)
    if (window.__API_BASE_URL__ && window.__API_BASE_URL__.trim()) {
      return window.__API_BASE_URL__.trim().replace(/\/+$/, '');
    }

    // 3. Check for meta tag <meta name="api-base-url" content="...">
    const metaTag = document.querySelector('meta[name="api-base-url"]');
    if (metaTag && metaTag.content && metaTag.content.trim() && !metaTag.content.startsWith('%')) {
      return metaTag.content.trim().replace(/\/+$/, '');
    }

    // 4. Default to local backend
    return DEFAULT_DEV_API_URL;
  }

  /**
   * Sets custom backend URL in localStorage (useful for live demonstrations).
   */
  function setApiBaseUrl(url) {
    if (!url) {
      localStorage.removeItem('careerfit_api_base_url');
    } else {
      localStorage.setItem('careerfit_api_base_url', url.trim().replace(/\/+$/, ''));
    }
  }

  return {
    getApiBaseUrl,
    setApiBaseUrl,
    DEFAULT_DEV_API_URL
  };
})();

// Attach to window
window.CareerFitConfig = CareerFitConfig;
