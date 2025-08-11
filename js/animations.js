/**
 * Модуль анимаций
 * Управление GIF анимациями, scroll-based эффектами и Intersection Observer
 */

class AnimationManager {
    constructor() {
        this.observers = {};
        this.scrollAnimations = new Map();
        this.gifControllers = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupGifControllers();
        this.setupParallaxEffects();
        this.bindEvents();
        
        this.isInitialized = true;
    }

    /**
     * Настройка Intersection Observer для появления элементов
     */
    setupIntersectionObserver() {
        // Базовый observer для fade-in эффектов
        this.observers.fadeIn = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Запуск GIF анимации при появлении
                    const gif = entry.target.querySelector('.scroll-gif');
                    if (gif) {
                        this.playGif(gif);
                    }
                } else {
                    entry.target.classList.remove('animate-in');
                    
                    // Остановка GIF при исчезновении
                    const gif = entry.target.querySelector('.scroll-gif');
                    if (gif) {
                        this.pauseGif(gif);
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observer для анимаций с задержкой
        this.observers.staggered = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const children = entry.target.querySelectorAll('.stagger-item');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.3
        });

        // Наблюдение за элементами
        this.observeElements();
    }

    observeElements() {
        // Элементы для базовой анимации появления
        const fadeElements = document.querySelectorAll('[data-animation="fade-in"], .scroll-animation, .typefaces-preview, .usp');
        fadeElements.forEach(el => {
            this.observers.fadeIn.observe(el);
        });

        // Элементы для анимации с задержкой
        const staggeredElements = document.querySelectorAll('[data-animation="staggered"], .typefaces-grid, .projects-grid');
        staggeredElements.forEach(el => {
            this.observers.staggered.observe(el);
        });
    }

    /**
     * Настройка scroll-based анимаций
     */
    setupScrollAnimations() {
        const scrollElements = document.querySelectorAll('[data-animation*="scroll-trigger"]');
        
        scrollElements.forEach(element => {
            const gif = element.querySelector('.scroll-gif, .animation-gif');
            if (gif) {
                this.scrollAnimations.set(element, {
                    gif: gif,
                    originalSrc: gif.src,
                    isPlaying: false,
                    threshold: 0.5
                });
            }
        });

        // Обработчик скролла с throttling
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollAnimations() {
        this.scrollAnimations.forEach((animation, element) => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top < window.innerHeight && 
                rect.bottom > 0
            );
            const visibilityRatio = this.calculateVisibilityRatio(rect);

            if (isVisible && visibilityRatio > animation.threshold) {
                if (!animation.isPlaying) {
                    this.playGif(animation.gif);
                    animation.isPlaying = true;
                }
            } else {
                if (animation.isPlaying) {
                    this.pauseGif(animation.gif);
                    animation.isPlaying = false;
                }
            }
        });
    }

    calculateVisibilityRatio(rect) {
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;
        
        let visibleHeight = 0;
        
        if (rect.top >= 0 && rect.bottom <= windowHeight) {
            // Элемент полностью видим
            visibleHeight = elementHeight;
        } else if (rect.top < 0 && rect.bottom > windowHeight) {
            // Элемент больше экрана
            visibleHeight = windowHeight;
        } else if (rect.top < 0) {
            // Элемент обрезан сверху
            visibleHeight = rect.bottom;
        } else if (rect.bottom > windowHeight) {
            // Элемент обрезан снизу
            visibleHeight = windowHeight - rect.top;
        }
        
        return Math.max(0, visibleHeight / elementHeight);
    }

    /**
     * Настройка контроллеров GIF
     */
    setupGifControllers() {
        const gifs = document.querySelectorAll('.scroll-gif, .animation-gif, [data-gif-control]');
        
        gifs.forEach(gif => {
            this.setupGifController(gif);
        });
    }

    setupGifController(gif) {
        const controller = {
            element: gif,
            originalSrc: gif.src,
            isPlaying: false,
            canvas: null,
            context: null,
            frames: [],
            currentFrame: 0,
            animationId: null
        };

        // Для оптимизации можно создать canvas версию
        if (gif.dataset.canvasOptimize === 'true') {
            this.createCanvasVersion(controller);
        }

        this.gifControllers.set(gif, controller);

        // Обработчики событий
        gif.addEventListener('mouseenter', () => {
            this.playGif(gif);
        });

        gif.addEventListener('mouseleave', () => {
            if (gif.dataset.pauseOnHover !== 'false') {
                this.pauseGif(gif);
            }
        });
    }

    createCanvasVersion(controller) {
        // Создание canvas для более точного контроля анимации
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = controller.element.naturalWidth || controller.element.offsetWidth;
        canvas.height = controller.element.naturalHeight || controller.element.offsetHeight;
        canvas.style.width = controller.element.style.width || '100%';
        canvas.style.height = controller.element.style.height || 'auto';
        
        controller.canvas = canvas;
        controller.context = context;
        
        // Замена img на canvas (опционально)
        if (controller.element.dataset.replaceWithCanvas === 'true') {
            controller.element.parentNode.replaceChild(canvas, controller.element);
            controller.element = canvas;
        }
    }

    /**
     * Методы управления GIF
     */
    playGif(gif) {
        const controller = this.gifControllers.get(gif);
        if (controller && !controller.isPlaying) {
            // Восстановление оригинального src для запуска анимации
            if (gif.src !== controller.originalSrc) {
                gif.src = controller.originalSrc;
            }
            controller.isPlaying = true;
            
            // Добавление класса для CSS анимаций
            gif.classList.add('gif-playing');
        }
    }

    pauseGif(gif) {
        const controller = this.gifControllers.get(gif);
        if (controller && controller.isPlaying) {
            controller.isPlaying = false;
            gif.classList.remove('gif-playing');
            
            // Остановка на первом кадре (требует дополнительной настройки)
            if (controller.canvas) {
                this.stopCanvasAnimation(controller);
            }
        }
    }

    stopCanvasAnimation(controller) {
        if (controller.animationId) {
            cancelAnimationFrame(controller.animationId);
            controller.animationId = null;
        }
    }

    /**
     * Parallax эффекты
     */
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;

        let ticking = false;
        const handleParallaxScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax(parallaxElements);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleParallaxScroll, { passive: true });
    }

    updateParallax(elements) {
        const scrollY = window.pageYOffset;
        
        elements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Привязка дополнительных событий
     */
    bindEvents() {
        // Обработчик изменения размера окна
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Обработчик изменения видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllAnimations();
            } else {
                this.resumeVisibleAnimations();
            }
        });

        // Обработчики для ручного управления анимациями
        document.addEventListener('click', (e) => {
            const gifControl = e.target.closest('[data-gif-toggle]');
            if (gifControl) {
                e.preventDefault();
                const targetGif = document.querySelector(gifControl.dataset.gifToggle);
                if (targetGif) {
                    this.toggleGif(targetGif);
                }
            }
        });
    }

    handleResize() {
        // Перерасчет позиций и размеров при изменении размера окна
        this.scrollAnimations.forEach((animation, element) => {
            // Обновление canvas размеров если используется
            const controller = this.gifControllers.get(animation.gif);
            if (controller && controller.canvas) {
                const rect = animation.gif.getBoundingClientRect();
                controller.canvas.width = rect.width;
                controller.canvas.height = rect.height;
            }
        });
    }

    pauseAllAnimations() {
        this.gifControllers.forEach((controller, gif) => {
            if (controller.isPlaying) {
                this.pauseGif(gif);
            }
        });
    }

    resumeVisibleAnimations() {
        this.scrollAnimations.forEach((animation, element) => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top < window.innerHeight && 
                rect.bottom > 0
            );
            
            if (isVisible) {
                this.playGif(animation.gif);
            }
        });
    }

    toggleGif(gif) {
        const controller = this.gifControllers.get(gif);
        if (controller) {
            if (controller.isPlaying) {
                this.pauseGif(gif);
            } else {
                this.playGif(gif);
            }
        }
    }

    /**
     * Публичные методы для внешнего использования
     */
    addScrollAnimation(element, options = {}) {
        const gif = element.querySelector('.scroll-gif, .animation-gif');
        if (gif) {
            this.scrollAnimations.set(element, {
                gif: gif,
                originalSrc: gif.src,
                isPlaying: false,
                threshold: options.threshold || 0.5
            });
            
            this.setupGifController(gif);
        }
    }

    removeScrollAnimation(element) {
        this.scrollAnimations.delete(element);
    }

    destroy() {
        // Очистка observers
        Object.values(this.observers).forEach(observer => {
            observer.disconnect();
        });

        // Очистка анимаций
        this.gifControllers.forEach((controller) => {
            this.stopCanvasAnimation(controller);
        });

        // Очистка событий
        window.removeEventListener('scroll', this.updateScrollAnimations);
        window.removeEventListener('resize', this.handleResize);

        this.isInitialized = false;
    }
}

// Инициализация менеджера анимаций
let animationManager;

document.addEventListener('DOMContentLoaded', () => {
    animationManager = new AnimationManager();
});

// Экспорт для глобального использования
window.AnimationManager = AnimationManager;
window.animationManager = animationManager;