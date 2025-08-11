/**
 * Главный модуль приложения
 * Координация работы всех модулей и инициализация функционала
 */

class App {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isInitialized = false;
        this.modules = {};
        this.globalData = {};
        
        this.init();
    }

    /**
     * Определение текущей страницы
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = document.body.dataset.page;
        
        if (page) return page;
        
        // Определение по URL
        if (path.includes('typefaces')) return 'typefaces';
        if (path.includes('fonts-in-use')) return 'fonts-in-use';
        if (path.includes('lettering')) return 'lettering';
        if (path.includes('about')) return 'about';
        if (path.includes('typeface/')) return 'typeface-detail';
        return 'home';
    }

    /**
     * Инициализация приложения
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Показ индикатора загрузки
            this.showLoadingIndicator();

            // Инициализация базовых модулей
            this.initBaseModules();

            // Загрузка данных в зависимости от страницы
            await this.loadPageData();

            // Инициализация специфичных для страницы модулей
            await this.initPageModules();

            // Инициализация глобальных обработчиков
            this.initGlobalHandlers();

            // Скрытие индикатора загрузки
            this.hideLoadingIndicator();

            this.isInitialized = true;
            console.log(`App initialized for page: ${this.currentPage}`);

        } catch (error) {
            console.error('App initialization failed:', error);
            this.showErrorMessage('Failed to load the application. Please refresh the page.');
        }
    }

    /**
     * Инициализация базовых модулей
     */
    initBaseModules() {
        // Проверка доступности модулей
        if (typeof window.AnimationManager !== 'undefined') {
            this.modules.animations = window.animationManager;
        }

        if (typeof window.DataLoader !== 'undefined') {
            this.modules.dataLoader = window.DataLoader;
        }
    }

    /**
     * Загрузка данных для страницы
     */
    async loadPageData() {
        if (!this.modules.dataLoader) return;

        try {
            switch (this.currentPage) {
                case 'home':
                    this.globalData = await this.modules.dataLoader.loadHomePageData();
                    break;
                    
                case 'typefaces':
                    this.globalData.typefaces = await this.modules.dataLoader.loadTypefaces();
                    break;
                    
                case 'fonts-in-use':
                    this.globalData.projects = await this.modules.dataLoader.loadProjects();
                    this.globalData.typefaces = await this.modules.dataLoader.loadTypefaces();
                    break;
                    
                case 'lettering':
                    this.globalData.lettering = await this.modules.dataLoader.loadLettering();
                    break;
                    
                case 'typeface-detail':
                    const fontId = this.extractFontIdFromUrl();
                    if (fontId) {
                        this.globalData.currentFont = await this.modules.dataLoader.loadTypefaceData(fontId);
                    }
                    break;
                    
                default:
                    // Загрузка базовых данных для остальных страниц
                    this.globalData.siteConfig = await this.modules.dataLoader.loadSiteConfig();
            }
            
            // Сохранение данных в глобальной области для доступа из других модулей
            window.appData = this.globalData;
            
        } catch (error) {
            console.error('Failed to load page data:', error);
        }
    }

    /**
     * Инициализация модулей специфичных для страницы
     */
    async initPageModules() {
        switch (this.currentPage) {
            case 'home':
                await this.initHomePage();
                break;
                
            case 'typefaces':
                await this.initTypefacesPage();
                break;
                
            case 'fonts-in-use':
                await this.initFontsInUsePage();
                break;
                
            case 'lettering':
                await this.initLetteringPage();
                break;
                
            case 'typeface-detail':
                await this.initTypefaceDetailPage();
                break;
                
            case 'about':
                await this.initAboutPage();
                break;
        }
    }

    /**
     * Инициализация главной страницы
     */
    async initHomePage() {
        // Рендеринг превью шрифтов
        this.renderTypefacesPreview();
        
        // Рендеринг превью проектов
        this.renderProjectsPreview();
        
        // Рендеринг превью леттеринга
        this.renderLetteringPreview();
        
        // Инициализация видео хедера
        this.initVideoHeader();
    }

    /**
     * Инициализация страницы шрифтов
     */
    async initTypefacesPage() {
        // Фильтры уже инициализированы в filters.js
        // Дополнительная настройка если нужна
        if (window.typefaceFilter && this.globalData.typefaces) {
            window.typefaceFilter.setData(this.globalData.typefaces.fonts);
        }
    }

    /**
     * Инициализация страницы проектов
     */
    async initFontsInUsePage() {
        // Фильтры уже инициализированы в filters.js
        if (window.projectFilter && this.globalData.projects) {
            window.projectFilter.setData(this.globalData.projects.projects);
        }
    }

    /**
     * Инициализация страницы леттеринга
     */
    async initLetteringPage() {
        // Фильтры инициализируются в самой странице
        // Дополнительная настройка если нужна
    }

    /**
     * Инициализация страницы деталей шрифта
     */
    async initTypefaceDetailPage() {
        if (this.globalData.currentFont) {
            // Рендеринг информации о шрифте
            this.renderTypefaceDetails();
            
            // Инициализация типтестера
            if (!this.globalData.currentFont.isExternal) {
                this.initTypetester();
            }
        }
    }

    /**
     * Инициализация страницы About
     */
    async initAboutPage() {
        // Специфичная логика для страницы About
        this.initContactForm();
    }

    /**
     * Рендеринг превью шрифтов на главной
     */
    renderTypefacesPreview() {
        const container = document.getElementById('typefaces-grid');
        if (!container || !this.globalData.typefaces) return;

        const typefaces = this.globalData.typefaces.slice(0, 6);
        
        container.innerHTML = typefaces.map(font => `
            <article class="typeface-card">
                <div class="typeface-card__preview">
                    <a href="typeface/${font.id}.html">
                        <img src="${font.previewSVG}" alt="${font.nameDisplay} Preview" loading="lazy">
                    </a>
                    ${font.type === 'variable' ? '<span class="typeface-card__badge">Variable</span>' : ''}
                </div>
                <div class="typeface-card__content">
                    <h3 class="typeface-card__title">
                        <a href="typeface/${font.id}.html">${font.nameDisplay}</a>
                    </h3>
                    <p class="typeface-card__meta">${font.styles} style${font.styles !== 1 ? 's' : ''} • ${font.displayPrice}</p>
                </div>
            </article>
        `).join('');
    }

    /**
     * Рендеринг превью проектов на главной
     */
    renderProjectsPreview() {
        const container = document.getElementById('projects-preview');
        if (!container || !this.globalData.projects) return;

        const projects = this.globalData.projects.slice(0, 4);
        
        container.innerHTML = projects.map(project => `
            <article class="project-card">
                <div class="project-card__image">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                </div>
                <div class="project-card__content">
                    <h3 class="project-card__title">${project.title}</h3>
                    <p class="project-card__client">${project.client}</p>
                </div>
            </article>
        `).join('');
    }

    /**
     * Рендеринг превью леттеринга на главной
     */
    renderLetteringPreview() {
        const container = document.getElementById('lettering-preview');
        if (!container || !this.globalData.lettering) return;

        const lettering = this.globalData.lettering.slice(0, 3);
        
        container.innerHTML = lettering.map(project => `
            <article class="lettering-card">
                <div class="lettering-card__image">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                </div>
                <div class="lettering-card__content">
                    <h3 class="lettering-card__title">${project.title}</h3>
                    <p class="lettering-card__style">${project.styleLabel}</p>
                </div>
            </article>
        `).join('');
    }

    /**
     * Инициализация видео хедера
     */
    initVideoHeader() {
        const video = document.querySelector('.hero__video');
        if (!video) return;

        // Автоматическое воспроизведение при загрузке
        video.addEventListener('loadeddata', () => {
            video.play().catch(error => {
                console.warn('Video autoplay failed:', error);
            });
        });

        // Пауза при потере фокуса
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                video.pause();
            } else {
                video.play().catch(() => {});
            }
        });
    }

    /**
     * Рендеринг деталей шрифта
     */
    renderTypefaceDetails() {
        const font = this.globalData.currentFont;
        if (!font) return;

        // Обновление заголовка страницы
        const title = document.querySelector('.page-hero__title');
        if (title) title.textContent = font.nameDisplay;

        // Обновление описания
        const description = document.querySelector('.page-hero__description');
        if (description) description.textContent = font.description;

        // Обновление цены
        const priceElements = document.querySelectorAll('.price');
        priceElements.forEach(el => el.textContent = font.displayPrice);

        // Обновление ссылок для внешних шрифтов
        if (font.isExternal) {
            const buyButtons = document.querySelectorAll('.btn-buy');
            buyButtons.forEach(btn => {
                btn.href = font.purchaseUrl;
                btn.target = '_blank';
                btn.rel = 'noopener';
                btn.textContent = `Buy on ${font.externalPlatform}`;
            });
        }
    }

    /**
     * Инициализация типтестера
     */
    initTypetester() {
        if (typeof window.initTypetester === 'function') {
            window.initTypetester(this.globalData.currentFont);
        }
    }

    /**
     * Инициализация контактной формы
     */
    initContactForm() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });
    }

    /**
     * Обработка отправки форм
     */
    handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Здесь будет логика отправки формы
        console.log('Form submitted:', Object.fromEntries(formData));
        
        // Показ сообщения об успехе
        this.showSuccessMessage('Thank you for your message! We\'ll get back to you soon.');
        form.reset();
    }

    /**
     * Инициализация глобальных обработчиков
     */
    initGlobalHandlers() {
        // Обработчик навигации
        this.initNavigation();
        
        // Обработчик ошибок изображений
        this.initImageErrorHandling();
        
        // Обработчик внешних ссылок
        this.initExternalLinks();
        
        // Обработчик cookie уведомлений (если нужно)
        // this.initCookieNotice();
    }

    /**
     * Инициализация навигации
     */
    initNavigation() {
        // Подсветка активного пункта навигации
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav__list a, .footer__nav a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('../', ''))) {
                link.classList.add('nav__link--active');
            }
        });

        // Мобильное меню (если есть)
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('mobile-menu--open');
            });
        }
    }

    /**
     * Обработка ошибок загрузки изображений
     */
    initImageErrorHandling() {
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG') {
                event.target.style.display = 'none';
                console.warn('Image failed to load:', event.target.src);
            }
        }, true);
    }

    /**
     * Обработка внешних ссылок
     */
    initExternalLinks() {
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        externalLinks.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }

    /**
     * Извлечение ID шрифта из URL
     */
    extractFontIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/typeface\/([^\/]+)\.html/);
        return match ? match[1] : null;
    }

    /**
     * Утилиты для показа сообщений
     */
    showLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.innerHTML = '<div class="loading-spinner"></div>';
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(indicator);
    }

    hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showErrorMessage(message) {
        console.error(message);
        // Здесь можно добавить показ toast уведомления или модального окна
    }

    showSuccessMessage(message) {
        console.log(message);
        // Здесь можно добавить показ toast уведомления
    }

    /**
     * Публичные методы для внешнего использования
     */
    getPageData() {
        return this.globalData;
    }

    getCurrentPageType() {
        return this.currentPage;
    }

    refreshData() {
        if (this.modules.dataLoader) {
            this.modules.dataLoader.clearCache();
            return this.loadPageData();
        }
    }
}

// Инициализация приложения при загрузке DOM
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// Экспорт для глобального использования
window.App = App;
window.app = app;