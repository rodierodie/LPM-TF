/**
 * Main JavaScript Module
 * Core functionality for the website
 */

class MainApp {
  constructor() {
    this.isLoaded = false;
    this.currentPage = this.getCurrentPage();
    this.scrollPosition = 0;
    this.isScrolling = false;
    this.resizeTimer = null;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
      } else {
        this.onDOMReady();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  /**
   * Handle DOM ready event
   */
  async onDOMReady() {
    console.log('DOM ready, initializing app...');
    
    // Initialize core components
    this.initializeNavigation();
    this.initializeScrollHandling();
    this.initializeBackToTop();
    this.initializeVideoHandling();
    this.initializeLazyLoading();
    this.initializeAccessibility();
    
    // Load page-specific content
    await this.loadPageContent();
    
    // Mark as loaded
    this.isLoaded = true;
    document.body.classList.add('app-loaded');
    
    console.log('App initialized successfully');
  }

  /**
   * Get current page identifier
   */
  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/' || path.endsWith('index.html')) {
      return 'home';
    } else if (path.includes('typeface/')) {
      return 'typeface';
    } else if (path.includes('fonts-in-use')) {
      return 'fonts-in-use';
    } else if (path.includes('lettering')) {
      return 'lettering';
    } else if (path.includes('about')) {
      return 'about';
    }
    
    return 'unknown';
  }

  /**
   * Initialize navigation functionality
   */
  initializeNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', this.handleAnchorClick.bind(this));
    });

    // Highlight current navigation item
    this.updateActiveNavigation();

    // Handle navigation visibility on scroll
    this.setupNavigationScroll();
  }

  /**
   * Handle anchor link clicks
   */
  handleAnchorClick(event) {
    event.preventDefault();
    
    const targetId = event.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      this.scrollToElement(targetElement);
    }
  }

  /**
   * Smooth scroll to element
   */
  scrollToElement(element, offset = 80) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Update active navigation item
   */
  updateActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav__link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      
      if (linkPath === currentPath || 
          (currentPath === '/' && link.getAttribute('href').startsWith('#'))) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }

  /**
   * Setup navigation scroll behavior
   */
  setupNavigationScroll() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (header) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down
          header.style.transform = 'translateY(-100%)';
        } else {
          // Scrolling up
          header.style.transform = 'translateY(0)';
        }
      }
      
      lastScrollY = currentScrollY;
    });
  }

  /**
   * Initialize scroll handling
   */
  initializeScrollHandling() {
    let ticking = false;

    const updateScrollPosition = () => {
      this.scrollPosition = window.pageYOffset;
      this.updateScrollProgress();
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    });

    // Throttled scroll for performance
    window.addEventListener('scroll', this.throttle(this.onScroll.bind(this), 16));
  }

  /**
   * Handle scroll events
   */
  onScroll() {
    // Update scroll-based animations or effects
    this.updateParallaxEffects();
    this.updateVisibilityStates();
  }

  /**
   * Update scroll progress indicator
   */
  updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    if (scrollProgress) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = scrolled + '%';
    }
  }

  /**
   * Update parallax effects
   */
  updateParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(this.scrollPosition * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  /**
   * Update element visibility states
   */
  updateVisibilityStates() {
    const observedElements = document.querySelectorAll('[data-observe]');
    
    observedElements.forEach(element => {
      if (this.isElementInViewport(element)) {
        element.classList.add('in-viewport');
      } else {
        element.classList.remove('in-viewport');
      }
    });
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return (
      rect.top >= -rect.height * threshold &&
      rect.bottom <= windowHeight + rect.height * threshold
    );
  }

  /**
   * Initialize back to top button
   */
  initializeBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      });
      
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Initialize video handling
   */
  initializeVideoHandling() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      // Ensure videos are properly loaded
      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded:', video.src);
      });

      // Handle video errors
      video.addEventListener('error', (e) => {
        console.error('Video error:', e, video.src);
        this.handleVideoError(video);
      });

      // Pause video when not in view (performance optimization)
      this.setupVideoIntersectionObserver(video);
    });
  }

  /**
   * Handle video loading errors
   */
  handleVideoError(video) {
    const container = video.closest('.hero__video-container');
    if (container) {
      // Replace with fallback image or hide video
      container.style.display = 'none';
      console.warn('Video failed to load, hiding video container');
    }
  }

  /**
   * Setup intersection observer for videos
   */
  setupVideoIntersectionObserver(video) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(e => console.log('Video autoplay prevented:', e));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(video);
  }

  /**
   * Initialize lazy loading
   */
  initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          this.scrollToElement(target);
        }
      });
    }

    // Keyboard navigation support
    this.setupKeyboardNavigation();
    
    // Focus management
    this.setupFocusManagement();
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC key handling
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      // Enter key on buttons
      if (e.key === 'Enter' && e.target.role === 'button') {
        e.target.click();
      }
    });
  }

  /**
   * Handle escape key press
   */
  handleEscapeKey() {
    // Close any open modals, menus, etc.
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      this.closeModal(activeModal);
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Trap focus in modals
    document.addEventListener('focusin', (e) => {
      const modal = e.target.closest('.modal');
      if (modal && modal.classList.contains('active')) {
        this.trapFocus(modal, e);
      }
    });
  }

  /**
   * Load page-specific content
   */
  async loadPageContent() {
    try {
      switch (this.currentPage) {
        case 'home':
          await this.loadHomeContent();
          break;
        case 'typeface':
          await this.loadTypefaceContent();
          break;
        case 'fonts-in-use':
          await this.loadFontsInUseContent();
          break;
        case 'lettering':
          await this.loadLetteringContent();
          break;
        case 'about':
          await this.loadAboutContent();
          break;
      }
    } catch (error) {
      console.error('Error loading page content:', error);
    }
  }

  /**
   * Load home page content
   */
  async loadHomeContent() {
    console.log('Loading home page content...');
    // Home page content is mostly static HTML
    // Any dynamic content would be loaded here
  }

  /**
   * Load typeface page content
   */
  async loadTypefaceContent() {
    console.log('Loading typeface page content...');
    // This would be implemented when typeface pages are created
  }

  /**
   * Load fonts in use content
   */
  async loadFontsInUseContent() {
    console.log('Loading fonts in use content...');
    // This would be implemented when the page is created
  }

  /**
   * Load lettering content
   */
  async loadLetteringContent() {
    console.log('Loading lettering content...');
    // This would be implemented when the page is created
  }

  /**
   * Load about content
   */
  async loadAboutContent() {
    console.log('Loading about content...');
    // This would be implemented when the page is created
  }

  /**
   * Utility function to throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Utility function to debounce function calls
   */
  debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  /**
   * Public method to reload the app
   */
  reload() {
    this.isLoaded = false;
    this.init();
  }

  /**
   * Public method to get app state
   */
  getState() {
    return {
      isLoaded: this.isLoaded,
      currentPage: this.currentPage,
      scrollPosition: this.scrollPosition
    };
  }
}

// Initialize the application
window.mainApp = new MainApp();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainApp;
}