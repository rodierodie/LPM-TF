/**
 * Модуль загрузки данных
 * Централизованная система загрузки JSON данных с кэшированием и обработкой ошибок
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.baseUrl = this.getBaseUrl();
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 секунда
    }

    /**
     * Определение базового URL в зависимости от текущей страницы
     */
    getBaseUrl() {
        const path = window.location.pathname;
        
        // Если мы на главной странице
        if (path === '/' || path.endsWith('index.html')) {
            return '';
        }
        
        // Если мы в папке pages или typeface
        if (path.includes('/pages/') || path.includes('/typeface/')) {
            return '../';
        }
        
        // Для остальных случаев
        return '';
    }

    /**
     * Базовый метод загрузки JSON с обработкой ошибок и кэшированием
     */
    async loadJSON(url, useCache = true) {
        const fullUrl = this.baseUrl + url;
        
        // Проверка кэша
        if (useCache && this.cache.has(fullUrl)) {
            return this.cache.get(fullUrl);
        }

        // Проверка на уже выполняющийся запрос
        if (this.loadingPromises.has(fullUrl)) {
            return this.loadingPromises.get(fullUrl);
        }

        // Создание промиса загрузки
        const loadingPromise = this.fetchWithRetry(fullUrl);
        this.loadingPromises.set(fullUrl, loadingPromise);

        try {
            const data = await loadingPromise;
            
            // Кэширование результата
            if (useCache) {
                this.cache.set(fullUrl, data);
            }
            
            return data;
        } catch (error) {
            console.error(`Error loading ${fullUrl}:`, error);
            throw error;
        } finally {
            // Удаление из списка загружающихся
            this.loadingPromises.delete(fullUrl);
        }
    }

    /**
     * Загрузка с повторными попытками
     */
    async fetchWithRetry(url, attempt = 1) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Валидация структуры данных
            this.validateData(url, data);
            
            return data;
        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.warn(`Attempt ${attempt} failed for ${url}, retrying...`);
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(url, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Задержка для повторных попыток
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Базовая валидация данных
     */
    validateData(url, data) {
        if (!data || typeof data !== 'object') {
            throw new Error(`Invalid data structure in ${url}`);
        }
        
        // Специфическая валидация для разных типов файлов
        if (url.includes('typefaces.json')) {
            if (!data.fonts || !Array.isArray(data.fonts)) {
                throw new Error('Invalid typefaces.json structure: missing fonts array');
            }
        } else if (url.includes('projects.json')) {
            if (!data.projects || !Array.isArray(data.projects)) {
                throw new Error('Invalid projects.json structure: missing projects array');
            }
        } else if (url.includes('lettering.json')) {
            if (!data.lettering || !Array.isArray(data.lettering)) {
                throw new Error('Invalid lettering.json structure: missing lettering array');
            }
        }
    }

    /**
     * Загрузка данных о шрифтах
     */
    async loadTypefaces() {
        try {
            const data = await this.loadJSON('data/typefaces.json');
            
            // Дополнительная обработка данных о шрифтах
            if (data.fonts) {
                data.fonts = data.fonts.map(font => ({
                    ...font,
                    // Обеспечение корректных путей к файлам
                    previewSVG: font.previewSVG?.startsWith('assets/') ? font.previewSVG : `assets/svg/${font.previewSVG}`,
                    // Добавление вычисляемых свойств
                    hasTypetester: !font.isExternal,
                    displayPrice: font.price || 'Contact for pricing',
                    // Нормализация массивов
                    features: font.features || [],
                    languages: font.languages || [],
                    staticStyles: font.staticStyles || []
                }));
            }
            
            return data;
        } catch (error) {
            console.error('Failed to load typefaces data:', error);
            // Возврат заглушки для предотвращения поломки сайта
            return {
                fonts: [],
                meta: {
                    totalFonts: 0,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    version: '1.0'
                }
            };
        }
    }

    /**
     * Загрузка данных о проектах
     */
    async loadProjects() {
        try {
            const data = await this.loadJSON('data/projects.json');
            
            // Дополнительная обработка данных о проектах
            if (data.projects) {
                data.projects = data.projects.map(project => ({
                    ...project,
                    // Обеспечение корректных путей к изображениям
                    image: project.image?.startsWith('assets/') ? project.image : `assets/images/projects/${project.image}`,
                    // Форматирование даты
                    formattedDate: this.formatDate(project.date),
                    // Нормализация массивов
                    fonts: project.fonts || [],
                    tags: project.tags || [],
                    // Добавление вычисляемых свойств
                    hasUrl: Boolean(project.url),
                    categoryLabel: this.getCategoryLabel(data.categories, project.category)
                }));
            }
            
            return data;
        } catch (error) {
            console.error('Failed to load projects data:', error);
            return {
                projects: [],
                categories: [],
                meta: {
                    totalProjects: 0,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    version: '1.0'
                }
            };
        }
    }

    /**
     * Загрузка данных о леттеринге
     */
    async loadLettering() {
        try {
            const data = await this.loadJSON('data/lettering.json');
            
            // Дополнительная обработка данных о леттеринге
            if (data.lettering) {
                data.lettering = data.lettering.map(project => ({
                    ...project,
                    // Обеспечение корректных путей к изображениям
                    image: project.image?.startsWith('assets/') ? project.image : `assets/images/lettering/${project.image}`,
                    // Форматирование даты
                    formattedDate: this.formatDate(project.date),
                    // Нормализация массивов
                    tags: project.tags || [],
                    // Добавление вычисляемых свойств
                    categoryLabel: this.getCategoryLabel(data.categories, project.category),
                    styleLabel: this.getStyleLabel(data.styles, project.style),
                    techniqueLabel: this.getTechniqueLabel(data.techniques, project.technique)
                }));
            }
            
            return data;
        } catch (error) {
            console.error('Failed to load lettering data:', error);
            return {
                lettering: [],
                categories: [],
                styles: [],
                techniques: [],
                meta: {
                    totalProjects: 0,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    version: '1.0'
                }
            };
        }
    }

    /**
     * Загрузка конфигурации сайта
     */
    async loadSiteConfig() {
        try {
            return await this.loadJSON('data/site-config.json');
        } catch (error) {
            console.error('Failed to load site config:', error);
            return {
                siteName: 'The Loveprinting Machine Type Foundry',
                siteDescription: 'Custom typefaces and lettering',
                contactEmail: 'info@loveprinting.com',
                socialLinks: {}
            };
        }
    }

    /**
     * Загрузка данных для конкретного шрифта
     */
    async loadTypefaceData(fontId) {
        try {
            const typefacesData = await this.loadTypefaces();
            const font = typefacesData.fonts.find(f => f.id === fontId);
            
            if (!font) {
                throw new Error(`Font with id "${fontId}" not found`);
            }
            
            return font;
        } catch (error) {
            console.error(`Failed to load data for font "${fontId}":`, error);
            throw error;
        }
    }

    /**
     * Вспомогательные методы
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    getCategoryLabel(categories, categoryId) {
        if (!categories || !Array.isArray(categories)) return categoryId;
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId;
    }

    getStyleLabel(styles, styleId) {
        if (!styles || !Array.isArray(styles)) return styleId;
        const style = styles.find(s => s.id === styleId);
        return style ? style.name : styleId;
    }

    getTechniqueLabel(techniques, techniqueId) {
        if (!techniques || !Array.isArray(techniques)) return techniqueId;
        const technique = techniques.find(t => t.id === techniqueId);
        return technique ? technique.name : techniqueId;
    }

    /**
     * Предзагрузка данных
     */
    async preloadData() {
        const promises = [
            this.loadTypefaces(),
            this.loadSiteConfig()
        ];
        
        // Предзагрузка дополнительных данных только если мы на соответствующих страницах
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('fonts-in-use') || currentPage.includes('index')) {
            promises.push(this.loadProjects());
        }
        
        if (currentPage.includes('lettering') || currentPage.includes('index')) {
            promises.push(this.loadLettering());
        }
        
        try {
            await Promise.all(promises);
            console.log('Data preloading completed');
        } catch (error) {
            console.warn('Some data failed to preload:', error);
        }
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        console.log('Data cache cleared');
    }

    /**
     * Получение статистики кэша
     */
    getCacheStats() {
        return {
            cachedItems: this.cache.size,
            loadingItems: this.loadingPromises.size,
            cachedUrls: Array.from(this.cache.keys())
        };
    }

    /**
     * Комбинированная загрузка для главной страницы
     */
    async loadHomePageData() {
        try {
            const [typefaces, projects, lettering] = await Promise.all([
                this.loadTypefaces(),
                this.loadProjects(),
                this.loadLettering()
            ]);
            
            return {
                typefaces: typefaces.fonts.slice(0, 6), // Первые 6 шрифтов для превью
                projects: projects.projects.filter(p => p.featured).slice(0, 4), // Избранные проекты
                lettering: lettering.lettering.filter(l => l.featured).slice(0, 3) // Избранные работы леттеринга
            };
        } catch (error) {
            console.error('Failed to load home page data:', error);
            return {
                typefaces: [],
                projects: [],
                lettering: []
            };
        }
    }
}

// Создание глобального экземпляра
const dataLoader = new DataLoader();

// Экспорт для использования в других модулях
window.DataLoader = dataLoader;

// Автоматическая предзагрузка при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    dataLoader.preloadData();
});

// Экспорт отдельных методов для удобства
window.loadTypefaces = () => dataLoader.loadTypefaces();
window.loadProjects = () => dataLoader.loadProjects();
window.loadLettering = () => dataLoader.loadLettering();
window.loadTypefaceData = (fontId) => dataLoader.loadTypefaceData(fontId);