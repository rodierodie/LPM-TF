/**
 * Updated Main JavaScript Module
 * Работает с модульной системой компонентов
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
    
    // Устанавливаем глобальную переменную текущей страницы
    window.currentPage = this.currentPage;
    
    // Ждем загрузки компонентов (они загружаются автоматически через components-loader.js)
    await this.waitForComponents();
    
    // Initialize core functionality
    this.initializeScrollHandling();
    this.initializeVideoHandling();
    this.initializeLazyLoading();
    this.initializeAccessibility();
    this.initializeSmoothScrolling();
    
    // Load page-specific content
    await this.loadPageContent();
    
    // Mark as loaded
    this.isLoaded = true;
    document.body.classList.add('app-loaded');
    
    console.log('App initialized successfully');
  }

  /**
   * Wait for components to load
   */
  async waitForComponents() {
    return new Promise((resolve) => {
      const checkComponents = () => {
        const header = document.querySelector('.header');
        const footer = document.querySelector('.footer');
        
        if (header && footer) {
          console.log('Components loaded');
          resolve();
        } else {
          setTimeout(checkComponents, 50);
        }
      };
      
      checkComponents();
    });
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
   * Initialize smooth scrolling for anchor links
   */
  initializeSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  /**
   * Initialize scroll handling
   */
  initializeScrollHandling() {
    let ticking = false;
    
    const updateScrollPosition = () => {
      this.scrollPosition = window.pageYOffset;
      this.handleScrollEffects();
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    });
  }

  /**
   * Handle scroll effects (header transparency, animations, etc.)
   */
  handleScrollEffects() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Add scrolled class for header background
    if (this.scrollPosition > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Parallax effects for hero sections
    const heroElement = document.querySelector('.hero');
    if (heroElement && this.scrollPosition < window.innerHeight) {
      const parallaxSpeed = 0.5;
      const yPos = -(this.scrollPosition * parallaxSpeed);
      heroElement.style.transform = `translateY(${yPos}px)`;
    }
  }

  /**
   * Initialize video handling
   */
  initializeVideoHandling() {
    const videos = document.querySelectorAll('video[autoplay]');
    
    videos.forEach(video => {
      // Ensure video plays properly
      video.muted = true;
      
      // Handle intersection observer for performance
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(console.warn);
          } else {
            video.pause();
          }
        });
      });
      
      observer.observe(video);
    });
  }

  /**
   * Initialize lazy loading for images
   */
  initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Focus management for modals and navigation
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          this.closeModal(activeModal);
        }
      }
    });

    // Skip to main content link
    this.addSkipLink();
  }

  /**
   * Add skip to main content link for accessibility
   */
  addSkipLink() {
    if (document.querySelector('.skip-link')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: 6px;
        top: 7px;
        z-index: 999999;
        padding: 8px 16px;
        background: #000;
        color: #fff;
        text-decoration: none;
        border-radius: 3px;
      `;
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Load page-specific content
   */
  async loadPageContent() {
    switch (this.currentPage) {
      case 'home':
        await this.loadHomePage();
        break;
      case 'fonts-in-use':
        await this.loadFontsInUsePage();
        break;
      case 'lettering':
        await this.loadLetteringPage();
        break;
      case 'typeface':
        await this.loadTypefacePage();
        break;
      case 'about':
        await this.loadAboutPage();
        break;
    }
  }

  /**
   * Load home page specific content
   */
  async loadHomePage() {
    try {
      // Load fonts for showcase
      if (window.dataLoader) {
        const fontsData = await window.dataLoader.getTypefaces();
        await this.renderFontsShowcase(fontsData);
      }

      // Load project previews
      if (window.dataLoader) {
        const projectsData = await window.dataLoader.getProjects();
        await this.renderProjectsPreview(projectsData);
      }
    } catch (error) {
      console.error('Error loading home page content:', error);
    }
  }

  /**
   * Load fonts in use page specific content
   */
  async loadFontsInUsePage() {
    try {
      if (window.dataLoader) {
        const projectsData = await window.dataLoader.getProjects();
        
        // Update results count
        const totalProjects = projectsData.projects?.length || 0;
        const countElement = document.querySelector('[data-count="projects"]');
        if (countElement) {
          countElement.textContent = `${totalProjects} projects`;
        }

        // Initialize filters
        if (window.filtersManager) {
          await window.filtersManager.loadDataForType('projects');
        }
      }
    } catch (error) {
      console.error('Error loading fonts in use page:', error);
    }
  }

  /**
   * Load lettering page specific content
   */
  async loadLetteringPage() {
    try {
      if (window.dataLoader) {
        const letteringData = await window.dataLoader.getLettering();
        
        // Initialize filters
        if (window.filtersManager) {
          await window.filtersManager.loadDataForType('lettering');
        }
      }
    } catch (error) {
      console.error('Error loading lettering page:', error);
    }
  }

  /**
   * Load typeface page specific content
   */
  async loadTypefacePage() {
    try {
      // Get font ID from URL
      const fontId = this.getFontIdFromURL();
      
      if (fontId && window.typetesterManager) {
        await window.typetesterManager.init(fontId);
      }
    } catch (error) {
      console.error('Error loading typeface page:', error);
    }
  }

  /**
   * Load about page specific content
   */
  async loadAboutPage() {
    // About page is mostly static, no special loading needed
    console.log('About page loaded');
  }

  /**
   * Get font ID from current URL
   */
  getFontIdFromURL() {
    const path = window.location.pathname;
    const match = path.match(/\/typeface\/([^/]+)\.html/);
    return match ? match[1] : null;
  }

  /**
   * Render fonts showcase for home page
   */
  async renderFontsShowcase(fontsData) {
    const container = document.getElementById('fonts-container');
    if (!container || !fontsData?.fonts) return;

    const showcases = fontsData.fonts.map(font => `
      <div class="font-showcase font-showcase--${font.id === 'retry-sans' ? 'black' : 'gray'}">
        <div class="font-showcase__content">
          <h2 class="font-showcase__title">${font.nameDisplay || font.name}</h2>
          <div class="font-showcase__preview">
            <img src="assets/svg/${font.previewSVG}" alt="${font.name} preview" loading="lazy">
          </div>
          <div class="font-showcase__meta">
            <span class="font-showcase__styles">${font.styles} styles</span>
            <a href="typeface/${font.id}.html" class="font-showcase__link">View details →</a>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = showcases;
  }

  /**
   * Render projects preview for home page
   */
  async renderProjectsPreview(projectsData) {
    const container = document.getElementById('projects-preview');
    if (!container || !projectsData?.projects) return;

    // Show first 6 projects
    const previewProjects = projectsData.projects.slice(0, 6);
    
    const projectsHTML = previewProjects.map((project, index) => `
      <div class="project-card ${index === 2 ? 'project-card--large' : ''}">
        <div class="project-card__image">
          ${project.images?.[0] ? 
            `<img src="assets/images/projects/${project.images[0]}" alt="${project.name}" loading="lazy">` :
            `<span>Project Preview</span>`
          }
        </div>
      </div>
    `).join('');

    container.innerHTML = projectsHTML;
  }

  /**
   * Close modal (for future modal functionality)
   */
  closeModal(modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Initialize app when script loads
if (typeof window !== 'undefined') {
  window.mainApp = new MainApp();
}