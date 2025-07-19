// Favicon loader script to ensure favicon appears on all pages
(function(): void {
  'use strict';
  
  // Function to ensure favicon is loaded
  function ensureFavicon(): void {
    // Check if favicon is already loaded
    const existingFavicon = document.querySelector('link[rel*="icon"]');
    
    if (!existingFavicon) {
      // Create and append favicon if not present
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = '/favicon.svg';
      favicon.type = 'image/svg+xml';
      document.head.appendChild(favicon);
    }
    
    // Also ensure ICO fallback
    const existingIco = document.querySelector('link[rel="shortcut icon"]');
    if (!existingIco) {
      const icoFavicon = document.createElement('link');
      icoFavicon.rel = 'shortcut icon';
      icoFavicon.href = '/favicon.ico';
      document.head.appendChild(icoFavicon);
    }
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureFavicon);
  } else {
    ensureFavicon();
  }
  
  // Also run on route changes (for SPA)
  if (typeof window !== 'undefined') {
    // Listen for navigation events
    window.addEventListener('popstate', ensureFavicon);
    
    // Override pushState to catch programmatic navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args: any[]): void {
      originalPushState.apply(this, args);
      setTimeout(ensureFavicon, 100);
    };
  }
})();