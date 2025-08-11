/**
 * Animations Module
 * Handles GIF animations, scroll effects, and visual transitions
 */

class AnimationsManager {
  constructor() {
    this.animatedElements = new Map();
    this.scrollPosition = 0;
    this.isScrolling = false;
    this.observers = new Map();
    
    this.init();
  }

  /**
   * Initialize animations system
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }

  /**
   * Handle DOM ready
   */
  onDOMReady() {
    this.setupIntersectionObservers();
    this.setupScrollAnimations();
    this.setupGifControls();
    this.setupParallaxEffects();
    this.setupRevealAnimations();
    this.initializePerformanceOptimizations();
    
    console.log('Animations initialized');
  }

  /**
   * Setup intersection observers for performance
   */
  setupIntersectionObservers() {
    // Observer for fade-in animations
    const fadeInObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          fadeInObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observer for slide-up animations
    const slideUpObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
          slideUpObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observer for scale animations
    const scaleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-scale-in');
          scaleObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '30px'
    });

    // Apply observers to elements
    document.querySelectorAll('[data-animate="fade-in"]').forEach(el => {
      fadeInObserver.observe(el);
    });

    document.querySelectorAll('[data-animate="slide-up"]').forEach(el => {
      slideUpObserver.observe(el);
    });

    document.querySelectorAll('[data-animate="scale-in"]').forEach(el => {
      scaleObserver.observe(el);
    });

    // Store observers for cleanup
    this.observers.set('fadeIn', fadeInObserver);
    this.observers.set('slideUp', slideUpObserver);
    this.observers.set('scale', scaleObserver);
  }

  /**
   * Setup scroll-based animations
   */
  setupScrollAnimations() {
    let ticking = false;

    const onScroll = () => {
      this.scrollPosition = window.pageYOffset;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollAnimations();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * Update scroll-based animations
   */
  updateScrollAnimations() {
    this.updateParallax();
    this.updateProgressBars();
    this.updateRevealElements();
    this.updateStickyElements();
  }

  /**
   * Setup GIF animation controls
   */
  setupGifControls() {
    const gifs = document.querySelectorAll('img[src*=".gif"]');
    
    gifs.forEach(gif => {
      this.setupGifIntersectionObserver(gif);
      this.setupGifPlaybackControls(gif);
    });
  }

  /**
   * Setup intersection observer for GIF optimization
   */
  setupGifIntersectionObserver(gif) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.playGif(gif);
        } else {
          this.pauseGif(gif);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(gif);
    this.observers.set(`gif-${gif.src}`, observer);
  }

  /**
   * Setup GIF playback controls
   */
  setupGifPlaybackControls(gif) {
    // Store original src
    const originalSrc = gif.src;
    gif.dataset.originalSrc = originalSrc;
    
    // Create static version path for GIFs in gif subfolder
    let staticSrc;
    if (originalSrc.includes('assets/animations/gif/')) {
      staticSrc = originalSrc.replace('/gif/', '/gif/').replace('.gif', '-static.jpg');
    } else {
      staticSrc = originalSrc.replace('.gif', '-static.jpg');
    }
    gif.dataset.staticSrc = staticSrc;
    
    // Add loading state
    gif.addEventListener('load', () => {
      gif.classList.add('gif-loaded');
    });

    // Handle errors gracefully
    gif.addEventListener('error', () => {
      console.warn('GIF failed to load:', originalSrc);
      gif.classList.add('gif-error');
    });
  }

  /**
   * Play GIF animation
   */
  playGif(gif) {
    if (gif.dataset.originalSrc && gif.src !== gif.dataset.originalSrc) {
      gif.src = gif.dataset.originalSrc;
      gif.classList.add('gif-playing');
    }
  }

  /**
   * Pause GIF animation (switch to static)
   */
  pauseGif(gif) {
    if (gif.dataset.staticSrc && gif.src !== gif.dataset.staticSrc) {
      // Only switch to static if it exists
      const img = new Image();
      img.onload = () => {
        gif.src = gif.dataset.staticSrc;
        gif.classList.remove('gif-playing');
      };
      img.onerror = () => {
        // Keep original GIF if static version doesn't exist
        console.log('Static version not available for:', gif.dataset.originalSrc);
      };
      img.src = gif.dataset.staticSrc;
    }
  }

  /**
   * Setup parallax effects
   */
  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5;
      const direction = element.dataset.parallaxDirection || 'up';
      
      this.animatedElements.set(element, {
        type: 'parallax',
        speed: speed,
        direction: direction,
        initialOffset: element.offsetTop
      });
    });
  }

  /**
   * Update parallax elements
   */
  updateParallax() {
    this.animatedElements.forEach((config, element) => {
      if (config.type === 'parallax') {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.bottom >= 0 && rect.top <= window.innerHeight;
        
        if (isVisible) {
          const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          const movement = (progress - 0.5) * 100 * config.speed;
          
          let transform = '';
          switch (config.direction) {
            case 'up':
              transform = `translateY(${-movement}px)`;
              break;
            case 'down':
              transform = `translateY(${movement}px)`;
              break;
            case 'left':
              transform = `translateX(${-movement}px)`;
              break;
            case 'right':
              transform = `translateX(${movement}px)`;
              break;
            case 'scale':
              const scale = 1 + (progress * 0.1);
              transform = `scale(${scale})`;
              break;
          }
          
          element.style.transform = transform;
        }
      }
    });
  }

  /**
   * Setup reveal animations
   */
  setupRevealAnimations() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    revealElements.forEach((element, index) => {
      const delay = element.dataset.revealDelay || index * 100;
      const direction = element.dataset.revealDirection || 'up';
      const distance = element.dataset.revealDistance || '30px';
      
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = this.getRevealTransform(direction, distance);
      element.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
      element.style.transitionDelay = `${delay}ms`;
      
      this.animatedElements.set(element, {
        type: 'reveal',
        revealed: false,
        direction: direction,
        distance: distance
      });
    });
  }

  /**
   * Get transform for reveal animation
   */
  getRevealTransform(direction, distance) {
    switch (direction) {
      case 'up':
        return `translateY(${distance})`;
      case 'down':
        return `translateY(-${distance})`;
      case 'left':
        return `translateX(${distance})`;
      case 'right':
        return `translateX(-${distance})`;
      case 'fade':
        return 'none';
      default:
        return `translateY(${distance})`;
    }
  }

  /**
   * Update reveal elements
   */
  updateRevealElements() {
    this.animatedElements.forEach((config, element) => {
      if (config.type === 'reveal' && !config.revealed) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible) {
          element.style.opacity = '1';
          element.style.transform = 'none';
          config.revealed = true;
        }
      }
    });
  }

  /**
   * Update progress bars
   */
  updateProgressBars() {
    const progressBars = document.querySelectorAll('[data-progress]');
    
    progressBars.forEach(bar => {
      const rect = bar.getBoundingClientRect();
      const isVisible = rect.bottom >= 0 && rect.top <= window.innerHeight;
      
      if (isVisible && !bar.classList.contains('progress-animated')) {
        const targetProgress = parseFloat(bar.dataset.progress) || 0;
        this.animateProgressBar(bar, targetProgress);
        bar.classList.add('progress-animated');
      }
    });
  }

  /**
   * Animate progress bar
   */
  animateProgressBar(bar, targetProgress) {
    const fill = bar.querySelector('.progress-fill') || bar;
    let currentProgress = 0;
    const increment = targetProgress / 60; // 60 frames for 1 second at 60fps
    
    const animate = () => {
      currentProgress += increment;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
      }
      
      fill.style.width = `${currentProgress}%`;
      
      if (currentProgress < targetProgress) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Update sticky elements
   */
  updateStickyElements() {
    const stickyElements = document.querySelectorAll('[data-sticky]');
    
    stickyElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const offset = parseFloat(element.dataset.stickyOffset) || 0;
      
      if (rect.top <= offset) {
        element.classList.add('is-stuck');
      } else {
        element.classList.remove('is-stuck');
      }
    });
  }

  /**
   * Initialize performance optimizations
   */
  initializePerformanceOptimizations() {
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disableAnimations();
    }

    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllAnimations();
      } else {
        this.resumeAllAnimations();
      }
    });

    // Optimize for low-end devices
    this.optimizeForDevice();
  }

  /**
   * Disable animations for accessibility
   */
  disableAnimations() {
    document.body.classList.add('no-animations');
    
    // Stop all GIF animations
    document.querySelectorAll('img[src*=".gif"]').forEach(gif => {
      this.pauseGif(gif);
    });
  }

  /**
   * Pause all animations
   */
  pauseAllAnimations() {
    document.body.classList.add('animations-paused');
    
    // Pause GIFs
    document.querySelectorAll('img[src*=".gif"]').forEach(gif => {
      this.pauseGif(gif);
    });
  }

  /**
   * Resume all animations
   */
  resumeAllAnimations() {
    document.body.classList.remove('animations-paused');
    
    // Resume GIFs that are in viewport
    document.querySelectorAll('img[src*=".gif"]').forEach(gif => {
      if (this.isElementInViewport(gif)) {
        this.playGif(gif);
      }
    });
  }

  /**
   * Optimize animations for device capabilities
   */
  optimizeForDevice() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.body.classList.add('low-end-device');
    }

    // Reduce animations on slow connections
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.body.classList.add('slow-connection');
        this.disableAnimations();
      }
    }
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
    );
  }

  /**
   * Cleanup animations
   */
  cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    
    // Clear animated elements
    this.animatedElements.clear();
    
    console.log('Animations cleaned up');
  }

  /**
   * Public method to trigger animation
   */
  triggerAnimation(element, animationType, options = {}) {
    switch (animationType) {
      case 'fade-in':
        element.classList.add('animate-fade-in');
        break;
      case 'slide-up':
        element.classList.add('animate-slide-up');
        break;
      case 'scale-in':
        element.classList.add('animate-scale-in');
        break;
      case 'bounce':
        element.classList.add('animate-bounce');
        setTimeout(() => element.classList.remove('animate-bounce'), 1000);
        break;
    }
  }

  /**
   * Public method to get animation state
   */
  getAnimationState() {
    return {
      scrollPosition: this.scrollPosition,
      animatedElementsCount: this.animatedElements.size,
      observersCount: this.observers.size
    };
  }
}

// Create global instance
window.animationsManager = new AnimationsManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationsManager;
}