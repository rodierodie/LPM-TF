/**
 * Main Application Script
 * The Loveprinting Machine Type Foundry
 * 
 * Coordinates all site functionality and initializes modules
 */

class LoveprintingApp {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.dataLoaded = false;
    this.siteData = {};
    this.typetester = null;
    this.fontLoader = null;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Load essential data first
      await this.loadSiteData();
      
      // Initialize common components
      this.initNavigation();
      this.initBackToTop();
      this.initSmoothScroll();
      
      // Initialize page-specific functionality
      await this.initPageSpecific();
      
      // Initialize animations after everything is loaded
      this.initAnimations();
      
      console.log('🖨 The Loveprinting Machine site initialized successfully');
    } catch (error) {
      console.error('Failed to initialize site:', error);
      this.handleInitError(error);
    }
  }

  /**
   * Detect current page type
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('/typeface/')) return 'font-detail';
    if (path.includes('/fonts-in-use')) return 'fonts-in-use';
    if (path.includes('/lettering')) return 'lettering';
    if (path.includes('/about')) return 'about';
    if (path.includes('index.html') || path === '/') return 'home';
    
    return 'unknown';
  }

  /**
   * Load essential site data
   */
  async loadSiteData() {
    if (typeof window.DataLoader === 'undefined') {
      console.warn('DataLoader not available, using fallback data');
      return;
    }

    try {
      this.siteData = await window.DataLoader.dataLoader.preloadAll();
      this.dataLoaded = true;
      
      // Store data globally for easy access
      window.SITE_DATA = this.siteData;
      
    } catch (error) {
      console.error('Failed to load site data:', error);
      this.siteData = this.getFallbackData();
    }
  }

  /**
   * Initialize page-specific functionality
   */
  async initPageSpecific() {
    switch (this.currentPage) {
      case 'home':
        await this.initHomePage();
        break;
      case 'font-detail':
        await this.initFontDetailPage();
        break;
      case 'fonts-in-use':
        await this.initFontsInUsePage();
        break;
      case 'lettering':
        await this.initLetteringPage();
        break;
      case 'about':
        await this.initAboutPage();
        break;
      default:
        console.log('No specific initialization for this page');
    }
  }

  /**
   * Initialize home page
   */
  async initHomePage() {
    console.log('Initializing home page...');
    
    // Load fonts grid
    await this.loadFontsGrid();
    
    // Load projects preview
    await this.loadProjectsPreview();
    
    // Initialize video/animation handling
    this.initHeroVideo();
  }

  /**
   * Initialize font detail page
   */
  async initFontDetailPage() {
    console.log('Initializing font detail page...');
    
    // Extract font ID from URL
    const fontId = this.extractFontIdFromURL();
    
    if (!fontId) {
      console.error('No font ID found in URL');
      return;
    }

    // Load font data
    const fontData = await this.loadFontData(fontId);
    
    if (!fontData) {
      console.error('Font not found:', fontId);
      this.handleFontNotFound();
      return;
    }

    // Initialize typetester
    await this.initTypetester(fontData);
    
    // Initialize character grid
    this.initCharacterGrid(fontData);
    
    // Load related projects
    await this.loadRelatedProjects(fontId);
  }

  /**
   * Initialize fonts in use page
   */
  async initFontsInUsePage() {
    console.log('Initializing fonts in use page...');
    
    // Initialize filters
    this.initProjectFilters();
    
    // Load all projects
    await this.loadAllProjects();
  }

  /**
   * Initialize lettering page
   */
  async initLetteringPage() {
    console.log('Initializing lettering page...');
    
    // Initialize lettering filters
    this.initLetteringFilters();
    
    // Load lettering projects
    await this.loadLetteringProjects();
  }

  /**
   * Initialize about page
   */
  async initAboutPage() {
    console.log('Initializing about page...');
    
    // Initialize stats animation
    this.initStatsAnimation();
    
    // Initialize contact form (if present)
    this.initContactForm();
  }

  /**
   * Load fonts grid for home page
   */
  async loadFontsGrid() {
    const fontsGrid = document.getElementById('fontsGrid');
    const footerFonts = document.getElementById('footerFonts');
    
    if (!fontsGrid || !this.dataLoaded) return;

    try {
      const fonts = this.siteData.typefaces?.fonts || [];
      
      fontsGrid.innerHTML = '';
      if (footerFonts) footerFonts.innerHTML = '';
      
      fonts.forEach(font => {
        // Create font card
        const fontCard = this.createFontCard(font);
        fontsGrid.appendChild(fontCard);
        
        // Add to footer
        if (footerFonts) {
          const footerLink = document.createElement('li');
          footerLink.innerHTML = `<a href="typeface/${font.id}.html">${font.nameDisplay}</a>`;
          footerFonts.appendChild(footerLink);
        }
      });
      
    } catch (error) {
      console.error('Error loading fonts grid:', error);
    }
  }

  /**
   * Create font card element
   */
  createFontCard(font) {
    const fontCard = document.createElement('div');
    fontCard.className = 'font-card';
    
    // Use theme color if available
    const themeColor = font.themeColor || 'var(--color-text)';
    
    fontCard.innerHTML = `
      <div class="font-info">
        <div class="font-name">${font.nameDisplay}</div>
        <div class="font-details">${font.styles} ${font.type === 'variable' ? '• Variable' : ''}</div>
      </div>
      <div class="font-preview">
        <div class="font-preview-text" style="font-family: '${font.name}', var(--font-secondary); color: ${themeColor};">
          ${font.defaultText}
        </div>
      </div>
      <div class="font-learn-more">
        Learn more →
      </div>
    `;
    
    // Add click handler
    fontCard.addEventListener('click', () => {
      window.location.href = `typeface/${font.id}.html`;
    });
    
    return fontCard;
  }

  /**
   * Initialize typetester
   */
  async initTypetester(fontData) {
    // Check if typetester elements exist
    if (!document.querySelector('#typetester')) return;
    
    try {
      // Initialize font loader
      if (typeof window.Typetester !== 'undefined') {
        this.fontLoader = new window.Typetester.TypetesterFontLoader();
        await this.fontLoader.loadFont(fontData);
        
        // Initialize typetester
        this.typetester = new window.Typetester.Typetester();
        this.typetester.setFont(fontData);
        
        // Load settings from URL if present
        this.typetester.loadFromURL();
      }
    } catch (error) {
      console.error('Error initializing typetester:', error);
      this.showTypetesterError();
    }
  }

  /**
   * Initialize navigation
   */
  initNavigation() {
    // Update active navigation state
    this.updateActiveNavigation();
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Update active navigation state
   */
  updateActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      if (href && (currentPath.includes(href) || 
          (href.includes('#') && currentPath === '/' || currentPath.includes('index.html')))) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Initialize back to top functionality
   */
  initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    
    // Scroll to top on click
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Initialize smooth scrolling
   */
  initSmoothScroll() {
    // Already handled in initNavigation, but could add more smooth scroll logic here
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    // Initialize scroll-triggered animations
    this.initScrollAnimations();
    
    // Initialize hover effects
    this.initHoverEffects();
  }

  /**
   * Initialize scroll animations
   */
  initScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements that should animate in
    document.querySelectorAll('.font-card, .project-card, .lettering-card').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Initialize hover effects
   */
  initHoverEffects() {
    // Add enhanced hover effects for cards
    document.querySelectorAll('.font-card, .project-card, .lettering-card').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        e.target.style.transform = 'translateY(-4px)';
      });
      
      card.addEventListener('mouseleave', (e) => {
        e.target.style.transform = 'translateY(0)';
      });
    });
  }

  /**
   * Initialize hero video
   */
  initHeroVideo() {
    const videoElement = document.querySelector('.hero-video video');
    if (videoElement) {
      // Autoplay with user interaction check
      videoElement.muted = true;
      videoElement.play().catch(e => {
        console.log('Video autoplay prevented:', e);
      });
    }
  }

  /**
   * Extract font ID from URL
   */
  extractFontIdFromURL() {
    const path = window.location.pathname;
    const matches = path.match(/\/typeface\/([^\/]+)\.html/);
    return matches ? matches[1] : null;
  }

  /**
   * Load font data by ID
   */
  async loadFontData(fontId) {
    if (!this.dataLoaded || !this.siteData.typefaces) return null;
    
    return this.siteData.typefaces.fonts.find(font => font.id === fontId);
  }

  /**
   * Handle initialization errors
   */
  handleInitError(error) {
    console.error('Site initialization failed:', error);
    
    // Show a user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff5733;
      color: white;
      text-align: center;
      padding: 10px;
      z-index: 10000;
      font-family: var(--font-secondary);
    `;
    errorDiv.textContent = 'Some features may not work properly. Please refresh the page.';
    document.body.prepend(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Handle font not found
   */
  handleFontNotFound() {
    const main = document.querySelector('.main');
    if (main) {
      main.innerHTML = `
        <div style="text-align: center; padding: 64px 32px;">
          <h1>Font Not Found</h1>
          <p>The requested font could not be found.</p>
          <a href="/" style="text-decoration: underline;">← Back to Home</a>
        </div>
      `;
    }
  }

  /**
   * Show typetester error
   */
  showTypetesterError() {
    const typetester = document.querySelector('#typetester');
    if (typetester) {
      typetester.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--color-text-secondary);">
          <p>Typetester temporarily unavailable</p>
          <p>Please check back later</p>
        </div>
      `;
    }
  }

  /**
   * Get fallback data when loading fails
   */
  getFallbackData() {
    return {
      typefaces: { fonts: [] },
      projects: { projects: [], categories: [] },
      lettering: { letterings: [], types: [] },
      'site-config': {
        site: {
          title: 'The Loveprinting Machine Type Foundry'
        }
      }
    };
  }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Create global app instance
  window.LoveprintingApp = new LoveprintingApp();
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause any animations or videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => video.pause());
  } else {
    // Page is visible, resume
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach(video => video.play().catch(() => {}));
  }
});

/**
 * Handle errors globally
 */
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault();
});

// Export for testing/debugging
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LoveprintingApp };
}