/**
 * Универсальная система фильтров
 * Модуль для фильтрации, поиска и сортировки данных
 */

class FilterSystem {
    constructor(options = {}) {
        this.container = options.container || null;
        this.data = options.data || [];
        this.activeFilters = {};
        this.searchQuery = '';
        this.sortBy = options.defaultSort || 'name';
        this.sortOrder = options.defaultOrder || 'asc';
        this.callbacks = {
            onFilter: options.onFilter || null,
            onSearch: options.onSearch || null,
            onSort: options.onSort || null,
            onRender: options.onRender || null
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Поиск
        const searchInput = document.querySelector('[data-filter="search"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearch(e.target.value);
            });
        }

        // Фильтры
        const filterElements = document.querySelectorAll('[data-filter-type]');
        filterElements.forEach(element => {
            element.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filterType;
                const value = e.target.value;
                
                if (e.target.type === 'checkbox') {
                    this.toggleFilter(filterType, value, e.target.checked);
                } else {
                    this.setFilter(filterType, value);
                }
            });
        });

        // Сортировка
        const sortSelect = document.querySelector('[data-sort]');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                this.setSort(sortBy, sortOrder || 'asc');
            });
        }

        // Кнопки сортировки
        const sortButtons = document.querySelectorAll('[data-sort-by]');
        sortButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sortBy = e.target.dataset.sortBy;
                const currentOrder = this.sortBy === sortBy ? this.sortOrder : 'asc';
                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                this.setSort(sortBy, newOrder);
                
                // Обновление визуального состояния кнопок
                this.updateSortButtonsState();
            });
        });

        // Сброс фильтров
        const resetButton = document.querySelector('[data-filter-reset]');
        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetFilters();
            });
        }
    }

    setData(data) {
        this.data = data;
        this.render();
    }

    setSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.render();
        
        if (this.callbacks.onSearch) {
            this.callbacks.onSearch(this.searchQuery);
        }
    }

    setFilter(filterType, value) {
        if (value === '' || value === 'all') {
            delete this.activeFilters[filterType];
        } else {
            this.activeFilters[filterType] = value;
        }
        this.render();
        
        if (this.callbacks.onFilter) {
            this.callbacks.onFilter(this.activeFilters);
        }
    }

    toggleFilter(filterType, value, isActive) {
        if (!this.activeFilters[filterType]) {
            this.activeFilters[filterType] = [];
        }

        if (isActive) {
            if (!this.activeFilters[filterType].includes(value)) {
                this.activeFilters[filterType].push(value);
            }
        } else {
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== value);
            if (this.activeFilters[filterType].length === 0) {
                delete this.activeFilters[filterType];
            }
        }

        this.render();
        
        if (this.callbacks.onFilter) {
            this.callbacks.onFilter(this.activeFilters);
        }
    }

    setSort(sortBy, sortOrder = 'asc') {
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.render();
        
        if (this.callbacks.onSort) {
            this.callbacks.onSort(sortBy, sortOrder);
        }
    }

    resetFilters() {
        this.activeFilters = {};
        this.searchQuery = '';
        
        // Сброс UI элементов
        const searchInput = document.querySelector('[data-filter="search"]');
        if (searchInput) searchInput.value = '';
        
        const filterInputs = document.querySelectorAll('[data-filter-type]');
        filterInputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = input.dataset.defaultValue || '';
            }
        });

        this.render();
    }

    getFilteredData() {
        let filteredData = [...this.data];

        // Применение поиска
        if (this.searchQuery) {
            filteredData = filteredData.filter(item => {
                const searchFields = ['name', 'nameDisplay', 'description', 'features'];
                return searchFields.some(field => {
                    const value = item[field];
                    if (Array.isArray(value)) {
                        return value.some(v => v.toLowerCase().includes(this.searchQuery));
                    }
                    return value && value.toLowerCase().includes(this.searchQuery);
                });
            });
        }

        // Применение фильтров
        Object.entries(this.activeFilters).forEach(([filterType, filterValue]) => {
            filteredData = filteredData.filter(item => {
                if (Array.isArray(filterValue)) {
                    // Множественный выбор (чекбоксы)
                    return filterValue.some(value => this.matchesFilter(item, filterType, value));
                } else {
                    // Одиночный выбор
                    return this.matchesFilter(item, filterType, filterValue);
                }
            });
        });

        // Применение сортировки
        filteredData.sort((a, b) => {
            let valueA = this.getSortValue(a, this.sortBy);
            let valueB = this.getSortValue(b, this.sortBy);

            // Преобразование для корректного сравнения
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();

            let comparison = 0;
            if (valueA > valueB) comparison = 1;
            if (valueA < valueB) comparison = -1;

            return this.sortOrder === 'desc' ? -comparison : comparison;
        });

        return filteredData;
    }

    matchesFilter(item, filterType, filterValue) {
        switch (filterType) {
            case 'type':
                return item.type === filterValue;
            case 'styles':
                const styleCount = parseInt(filterValue);
                if (filterValue === '1-5') return item.styles <= 5;
                if (filterValue === '6-10') return item.styles >= 6 && item.styles <= 10;
                if (filterValue === '11+') return item.styles >= 11;
                return item.styles === styleCount;
            case 'status':
                return item.status === filterValue;
            case 'external':
                return item.isExternal === (filterValue === 'true');
            case 'price':
                const price = parseInt(item.price.replace('$', ''));
                if (filterValue === '0-50') return price <= 50;
                if (filterValue === '51-100') return price >= 51 && price <= 100;
                if (filterValue === '101+') return price >= 101;
                return false;
            case 'features':
                return item.features && item.features.includes(filterValue);
            case 'languages':
                return item.languages && item.languages.includes(filterValue);
            default:
                return item[filterType] === filterValue;
        }
    }

    getSortValue(item, sortBy) {
        switch (sortBy) {
            case 'name':
                return item.nameDisplay || item.name;
            case 'price':
                return parseInt(item.price.replace('$', ''));
            case 'styles':
                return item.styles;
            case 'date':
                return item.releaseDate || item.lastUpdated || '2025-01-01';
            default:
                return item[sortBy] || '';
        }
    }

    updateSortButtonsState() {
        const sortButtons = document.querySelectorAll('[data-sort-by]');
        sortButtons.forEach(button => {
            const buttonSortBy = button.dataset.sortBy;
            button.classList.remove('sort-asc', 'sort-desc', 'sort-active');
            
            if (buttonSortBy === this.sortBy) {
                button.classList.add('sort-active', `sort-${this.sortOrder}`);
            }
        });
    }

    updateResultsCount() {
        const filteredData = this.getFilteredData();
        const countElement = document.querySelector('[data-results-count]');
        if (countElement) {
            countElement.textContent = `${filteredData.length} результат${filteredData.length === 1 ? '' : (filteredData.length < 5 ? 'а' : 'ов')}`;
        }
    }

    render() {
        const filteredData = this.getFilteredData();
        this.updateResultsCount();
        this.updateSortButtonsState();
        
        if (this.callbacks.onRender) {
            this.callbacks.onRender(filteredData);
        }
        
        return filteredData;
    }

    // Метод для экспорта состояния фильтров в URL
    exportToURL() {
        const params = new URLSearchParams();
        
        if (this.searchQuery) {
            params.set('search', this.searchQuery);
        }
        
        Object.entries(this.activeFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else {
                params.set(key, value);
            }
        });
        
        if (this.sortBy !== 'name') {
            params.set('sort', `${this.sortBy}:${this.sortOrder}`);
        }
        
        return params.toString();
    }

    // Метод для импорта состояния фильтров из URL
    importFromURL(urlString = window.location.search) {
        const params = new URLSearchParams(urlString);
        
        // Поиск
        const search = params.get('search');
        if (search) {
            this.setSearch(search);
            const searchInput = document.querySelector('[data-filter="search"]');
            if (searchInput) searchInput.value = search;
        }
        
        // Фильтры
        params.forEach((value, key) => {
            if (key === 'search' || key === 'sort') return;
            
            if (value.includes(',')) {
                // Множественный выбор
                const values = value.split(',');
                values.forEach(v => {
                    this.toggleFilter(key, v, true);
                    const checkbox = document.querySelector(`[data-filter-type="${key}"][value="${v}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            } else {
                // Одиночный выбор
                this.setFilter(key, value);
                const select = document.querySelector(`[data-filter-type="${key}"]`);
                if (select) select.value = value;
            }
        });
        
        // Сортировка
        const sort = params.get('sort');
        if (sort) {
            const [sortBy, sortOrder] = sort.split(':');
            this.setSort(sortBy, sortOrder);
        }
        
        this.render();
    }
}

// Специализированные фильтры для разных типов данных
class TypefaceFilter extends FilterSystem {
    constructor(options = {}) {
        super({
            ...options,
            defaultSort: 'name',
            defaultOrder: 'asc'
        });
    }

    matchesFilter(item, filterType, filterValue) {
        // Дополнительная логика для шрифтов
        if (filterType === 'variableAxes') {
            return item.variableAxes && Object.keys(item.variableAxes).includes(filterValue);
        }
        
        return super.matchesFilter(item, filterType, filterValue);
    }
}

class ProjectFilter extends FilterSystem {
    constructor(options = {}) {
        super({
            ...options,
            defaultSort: 'date',
            defaultOrder: 'desc'
        });
    }

    matchesFilter(item, filterType, filterValue) {
        // Дополнительная логика для проектов
        if (filterType === 'fonts') {
            return item.fonts && item.fonts.includes(filterValue);
        }
        
        if (filterType === 'category') {
            return item.category === filterValue;
        }
        
        return super.matchesFilter(item, filterType, filterValue);
    }
}

// Экспорт для использования в других модулях
window.FilterSystem = FilterSystem;
window.TypefaceFilter = TypefaceFilter;
window.ProjectFilter = ProjectFilter;

// Автоинициализация при наличии соответствующих элементов на странице
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация для страницы шрифтов
    if (document.querySelector('[data-page="typefaces"]')) {
        window.typefaceFilter = new TypefaceFilter({
            onRender: (filteredData) => {
                if (window.renderTypefaces) {
                    window.renderTypefaces(filteredData);
                }
            }
        });
    }
    
    // Инициализация для страницы проектов
    if (document.querySelector('[data-page="fonts-in-use"]')) {
        window.projectFilter = new ProjectFilter({
            onRender: (filteredData) => {
                if (window.renderProjects) {
                    window.renderProjects(filteredData);
                }
            }
        });
    }
});