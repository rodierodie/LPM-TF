/**
 * Utility Functions
 * The Loveprinting Machine Type Foundry
 * 
 * Collection of utility functions for common tasks
 */

/**
 * DOM Utilities
 */
const DOM = {
  /**
   * Query selector with optional context
   * @param {string} selector - CSS selector
   * @param {Element} context - Optional context element
   * @returns {Element|null} Found element
   */
  $(selector, context = document) {
    return context.querySelector(selector);
  },

  /**
   * Query selector all with optional context
   * @param {string} selector - CSS selector
   * @param {Element} context - Optional context element
   * @returns {NodeList} Found elements
   */
  $$(selector, context = document) {
    return context.querySelectorAll(selector);
  },

  /**
   * Create element with optional attributes and content
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string|Element|Array} content - Element content
   * @returns {Element} Created element
   */
  create(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    }
    
    return element;
  },

  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {boolean} Is element visible
   */
  isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    
    return vertInView && horInView;
  },

  /**
   * Add event listener with automatic cleanup
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {Function} Cleanup function
   */
  on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  /**
   * Debounced event listener
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} delay - Debounce delay in ms
   * @returns {Function} Cleanup function
   */
  onDebounced(element, event, handler, delay = 250) {
    const debouncedHandler = Utils.debounce(handler, delay);
    return this.on(element, event, debouncedHandler);
  }
};

/**
 * Animation Utilities
 */
const Animation = {
  /**
   * Smooth scroll to element
   * @param {Element|string} target - Target element or selector
   * @param {Object} options - Scroll options
   */
  scrollTo(target, options = {}) {
    const element = typeof target === 'string' ? DOM.$(target) : target;
    if (!element) return;
    
    const defaults = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };
    
    element.scrollIntoView({ ...defaults, ...options });
  },

  /**
   * Animate value from start to end
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} duration - Animation duration in ms
   * @param {Function} callback - Callback with current value
   * @param {Function} easing - Easing function
   * @returns {Function} Cancel function
   */
  animate(start, end, duration, callback, easing = t => t) {
    let startTime = null;
    let cancelled = false;
    
    function step(timestamp) {
      if (cancelled) return;
      
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easing(progress);
      const current = start + (end - start) * easedProgress;
      
      callback(current, progress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    
    requestAnimationFrame(step);
    
    return () => { cancelled = true; };
  },

  /**
   * Fade in element
   * @param {Element} element - Target element
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} Animation completion promise
   */
  fadeIn(element, duration = 300) {
    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.display = 'block';
      
      this.animate(0, 1, duration, (value) => {
        element.style.opacity = value;
      }, this.easing.easeOut);
      
      setTimeout(resolve, duration);
    });
  },

  /**
   * Fade out element
   * @param {Element} element - Target element
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} Animation completion promise
   */
  fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      this.animate(1, 0, duration, (value) => {
        element.style.opacity = value;
      }, this.easing.easeOut);
      
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  },

  /**
   * Easing functions
   */
  easing: {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }
};

/**
 * General Utilities
 */
const Utils = {
  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Deep clone object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Generate unique ID
   * @param {string} prefix - Optional prefix
   * @returns {string} Unique ID
   */
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Convert string to kebab-case
   * @param {string} str - String to convert
   * @returns {string} Kebab-case string
   */
  kebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} Prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if device supports touch
   * @returns {boolean} Supports touch
   */
  supportsTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get viewport size
   * @returns {Object} Viewport dimensions
   */
  getViewportSize() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  }
};

/**
 * Font Loading Utilities
 */
const FontUtils = {
  /**
   * Check if font is loaded
   * @param {string} fontFamily - Font family name
   * @param {string} testText - Text to test with
   * @returns {Promise<boolean>} Font load status
   */
  async isFontLoaded(fontFamily, testText = 'giItT1WQy@!-/#') {
    if (!document.fonts || !document.fonts.check) {
      // Fallback for browsers without FontFace API
      return this.checkFontFallback(fontFamily, testText);
    }
    
    try {
      return document.fonts.check(`12px "${fontFamily}"`);
    } catch (error) {
      console.warn('Font check failed:', error);
      return false;
    }
  },

  /**
   * Fallback font detection method
   * @param {string} fontFamily - Font family name
   * @param {string} testText - Text to test with
   * @returns {boolean} Font availability
   */
  checkFontFallback(fontFamily, testText) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    context.font = '72px monospace';
    const baselineWidth = context.measureText(testText).width;
    
    context.font = `72px "${fontFamily}", monospace`;
    const testWidth = context.measureText(testText).width;
    
    return baselineWidth !== testWidth;
  },

  /**
   * Wait for font to load
   * @param {string} fontFamily - Font family name
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<boolean>} Load success
   */
  async waitForFont(fontFamily, timeout = 3000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await this.isFontLoaded(fontFamily)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  },

  /**
   * Get optimal font display value
   * @returns {string} Font display value
   */
  getOptimalFontDisplay() {
    // Use 'swap' for better user experience
    return 'swap';
  }
};

/**
 * Performance Utilities
 */
const Performance = {
  /**
   * Measure function execution time
   * @param {Function} func - Function to measure
   * @param {...any} args - Function arguments
   * @returns {Object} Result and timing
   */
  measure(func, ...args) {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    return {
      result,
      duration: end - start
    };
  },

  /**
   * Lazy load images
   * @param {string} selector - Image selector
   * @param {Object} options - Intersection observer options
   */
  lazyLoadImages(selector = 'img[data-src]', options = {}) {
    const images = DOM.$$(selector);
    
    const defaultOptions = {
      rootMargin: '50px 0px',
      threshold: 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { ...defaultOptions, ...options });
    
    images.forEach(img => observer.observe(img));
  },

  /**
   * Preload critical resources
   * @param {Array} resources - Array of resource URLs
   * @returns {Promise} Preload completion
   */
  preloadResources(resources) {
    const promises = resources.map(resource => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.url;
        link.as = resource.type || 'fetch';
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });
    
    return Promise.allSettled(promises);
  }
};

/**
 * Accessibility Utilities
 */
const A11y = {
  /**
   * Announce to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Announcement priority
   */
  announce(message, priority = 'polite') {
    const announcer = DOM.$('#sr-announcer') || this.createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  },

  /**
   * Create screen reader announcer
   * @returns {Element} Announcer element
   */
  createAnnouncer() {
    const announcer = DOM.create('div', {
      id: 'sr-announcer',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only'
    });
    
    // Add styles for screen reader only
    announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(announcer);
    return announcer;
  },

  /**
   * Trap focus within element
   * @param {Element} element - Container element
   * @returns {Function} Release function
   */
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }
};

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOM,
    Animation,
    Utils,
    FontUtils,
    Performance,
    A11y
  };
} else {
  // Global namespace for browser usage
  window.LoveprintingUtils = {
    DOM,
    Animation,
    Utils,
    FontUtils,
    Performance,
    A11y
  };
}