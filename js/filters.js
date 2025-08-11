/**
 * Filters Module
 * Handles filtering and sorting of typefaces, projects, and lettering
 */

class FiltersManager {
  constructor() {
    this.activeFilters = new Map();
    this.sortCriteria = {
      field: 'name',
      direction: 'asc'
    };
    this.searchQuery = '';
    this.filteredData = [];
    this.originalData = [];
    this.currentDataType = null;
    
    this.init();
  }

  /**
   * Initialize filters system
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
    this.setupFilterInterface();
    this.bindEvents();
    this.loadInitialData();
    
    console.log('Filters initialized');
  }

  /**
   * Setup filter interface
   */
  setupFilterInterface() {
    this.createFilterControls();
    this.createSortControls();
    this.createSearchControls();
  }

  /**
   * Create filter controls
   */
  createFilterControls() {
    const filterContainers = document.querySelectorAll('.filters-container');
    
    filterContainers.forEach(container => {
      const dataType = container.dataset.type;
      this.createFiltersForType(container, dataType);
    });
  }

  /**
   * Create filters for specific data type
   */
  createFiltersForType(container, dataType) {
    let filterConfig = {};

    switch (dataType) {
      case 'typefaces':
        filterConfig = {
          type: ['serif', 'sans-serif', 'display', 'script', 'mono'],
          styles: ['1', '2-5', '6-10', '10+'],
          variable: ['yes', 'no'],
          category: ['text', 'display', 'branding', 'editorial']
        };
        break;
      case 'projects':
        filterConfig = {
          category: ['branding', 'editorial', 'web', 'packaging', 'signage'],
          year: ['2024', '2023', '2022', '2021', 'older'],
          featured: ['yes', 'no']
        };
        break;
      case 'lettering':
        filterConfig = {
          type: ['logotype', 'poster', 'mural', 'packaging', 'editorial'],
          style: ['script', 'sans', 'serif', 'decorative'],
          year: ['2024', '2023', '2022', '2021', 'older']
        };
        break;
    }

    if (Object.keys(filterConfig).length > 0) {
      const filtersHTML = this.generateFiltersHTML(filterConfig, dataType);
      container.innerHTML = filtersHTML;
    }
  }

  /**
   * Generate filters HTML
   */
  generateFiltersHTML(filterConfig, dataType) {
    return `
      <div class="filters" data-type="${dataType}">
        <div class="filters__header">
          <h3 class="filters__title">Filter</h3>
          <button class="filters__clear" data-type="${dataType}">Clear All</button>
        </div>
        
        ${Object.entries(filterConfig).map(([filterKey, options]) => `
          <div class="filter-group" data-filter="${filterKey}">
            <h4 class="filter-group__title">${this.getFilterDisplayName(filterKey)}</h4>
            <div class="filter-group__options">
              ${options.map(option => `
                <label class="filter-option">
                  <input 
                    type="checkbox" 
                    class="filter-option__input"
                    data-type="${dataType}"
                    data-filter="${filterKey}" 
                    data-value="${option}"
                  >
                  <span class="filter-option__label">${this.getOptionDisplayName(option)}</span>
                  <span class="filter-option__count">0</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Get display name for filter
   */
  getFilterDisplayName(filterKey) {
    const displayNames = {
      type: 'Type',
      styles: 'Number of Styles',
      variable: 'Variable Font',
      category: 'Category',
      year: 'Year',
      featured: 'Featured',
      style: 'Style'
    };
    
    return displayNames[filterKey] || filterKey.charAt(0).toUpperCase() + filterKey.slice(1);
  }

  /**
   * Get display name for option
   */
  getOptionDisplayName(option) {
    const displayNames = {
      'sans-serif': 'Sans Serif',
      'mono': 'Monospace',
      '2-5': '2-5 styles',
      '6-10': '6-10 styles',
      '10+': '10+ styles',
      'yes': 'Yes',
      'no': 'No',
      'older': 'Before 2021'
    };
    
    return displayNames[option] || option.charAt(0).toUpperCase() + option.slice(1);
  }

  /**
   * Create sort controls
   */
  createSortControls() {
    const sortContainers = document.querySelectorAll('.sort-container');
    
    sortContainers.forEach(container => {
      const dataType = container.dataset.type;
      const sortHTML = this.generateSortHTML(dataType);
      container.innerHTML = sortHTML;
    });
  }

  /**
   * Generate sort HTML
   */
  generateSortHTML(dataType) {
    let sortOptions = {};

    switch (dataType) {
      case 'typefaces':
        sortOptions = {
          name: 'Name',
          styles: 'Number of Styles',
          recent: 'Most Recent'
        };
        break;
      case 'projects':
        sortOptions = {
          name: 'Name',
          year: 'Year',
          category: 'Category'
        };
        break;
      case 'lettering':
        sortOptions = {
          title: 'Title',
          year: 'Year',
          type: 'Type'
        };
        break;
    }

    return `
      <div class="sort-controls" data-type="${dataType}">
        <label class="sort-controls__label">Sort by:</label>
        <select class="sort-controls__select" data-type="${dataType}">
          ${Object.entries(sortOptions).map(([value, label]) => `
            <option value="${value}">${label}</option>
          `).join('')}
        </select>
        <button class="sort-controls__direction" data-type="${dataType}" data-direction="asc">
          <span class="sort-controls__arrow">↑</span>
        </button>
      </div>
    `;
  }

  /**
   * Create search controls
   */
  createSearchControls() {
    const searchContainers = document.querySelectorAll('.search-container');
    
    searchContainers.forEach(container => {
      const dataType = container.dataset.type;
      const searchHTML = this.generateSearchHTML(dataType);
      container.innerHTML = searchHTML;
    });
  }

  /**
   * Generate search HTML
   */
  generateSearchHTML(dataType) {
    const placeholders = {
      typefaces: 'Search fonts...',
      projects: 'Search projects...',
      lettering: 'Search lettering...'
    };

    return `
      <div class="search-controls" data-type="${dataType}">
        <input 
          type="text" 
          class="search-controls__input" 
          placeholder="${placeholders[dataType] || 'Search...'}"
          data-type="${dataType}"
        >
        <button class="search-controls__clear" data-type="${dataType}">
          <span>×</span>
        </button>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter checkboxes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('filter-option__input')) {
        this.handleFilterChange(e);
      }
    });

    // Sort controls
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('sort-controls__select')) {
        this.handleSortChange(e);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.sort-controls__direction')) {
        this.handleSortDirectionChange(e);
      }
    });

    // Search controls
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('search-controls__input')) {
        this.handleSearchInput(e);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.search-controls__clear')) {
        this.handleSearchClear(e);
      }
    });

    // Clear filters
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('filters__clear')) {
        this.handleClearFilters(e);
      }
    });
  }

  /**
   * Handle filter change
   */
  handleFilterChange(e) {
    const { type, filter, value } = e.target.dataset;
    const isChecked = e.target.checked;

    if (!this.activeFilters.has(type)) {
      this.activeFilters.set(type, new Map());
    }

    const typeFilters = this.activeFilters.get(type);
    
    if (!typeFilters.has(filter)) {
      typeFilters.set(filter, new Set());
    }

    const filterValues = typeFilters.get(filter);

    if (isChecked) {
      filterValues.add(value);
    } else {
      filterValues.delete(value);
    }

    // Clean up empty filters
    if (filterValues.size === 0) {
      typeFilters.delete(filter);
    }
    if (typeFilters.size === 0) {
      this.activeFilters.delete(type);
    }

    this.applyFilters(type);
  }

  /**
   * Handle sort change
   */
  handleSortChange(e) {
    const dataType = e.target.dataset.type;
    const field = e.target.value;
    
    this.sortCriteria.field = field;
    this.applySorting(dataType);
  }

  /**
   * Handle sort direction change
   */
  handleSortDirectionChange(e) {
    const button = e.target.closest('.sort-controls__direction');
    const dataType = button.dataset.type;
    const currentDirection = button.dataset.direction;
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    button.dataset.direction = newDirection;
    button.querySelector('.sort-controls__arrow').textContent = newDirection === 'asc' ? '↑' : '↓';
    
    this.sortCriteria.direction = newDirection;
    this.applySorting(dataType);
  }

  /**
   * Handle search input
   */
  handleSearchInput(e) {
    const dataType = e.target.dataset.type;
    const query = e.target.value.trim();
    
    this.searchQuery = query;
    this.applySearch(dataType);
    
    // Show/hide clear button
    const clearButton = e.target.parentNode.querySelector('.search-controls__clear');
    if (clearButton) {
      clearButton.style.display = query ? 'block' : 'none';
    }
  }

  /**
   * Handle search clear
   */
  handleSearchClear(e) {
    const dataType = e.target.closest('.search-controls__clear').dataset.type;
    const input = document.querySelector(`.search-controls__input[data-type="${dataType}"]`);
    
    if (input) {
      input.value = '';
      this.searchQuery = '';
      this.applySearch(dataType);
      e.target.style.display = 'none';
    }
  }

  /**
   * Handle clear all filters
   */
  handleClearFilters(e) {
    const dataType = e.target.dataset.type;
    
    // Clear active filters for this type
    this.activeFilters.delete(dataType);
    
    // Uncheck all checkboxes
    document.querySelectorAll(`.filter-option__input[data-type="${dataType}"]`).forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Clear search
    const searchInput = document.querySelector(`.search-controls__input[data-type="${dataType}"]`);
    if (searchInput) {
      searchInput.value = '';
      this.searchQuery = '';
    }
    
    this.applyFilters(dataType);
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      // Load data for each type that has filter containers
      const filterContainers = document.querySelectorAll('.filters-container[data-type]');
      
      for (const container of filterContainers) {
        const dataType = container.dataset.type;
        await this.loadDataForType(dataType);
      }
    } catch (error) {
      console.error('Error loading initial filter data:', error);
    }
  }

  /**
   * Load data for specific type
   */
  async loadDataForType(dataType) {
    try {
      let data = [];
      
      switch (dataType) {
        case 'typefaces':
          const typefacesData = await window.dataLoader.getTypefaces();
          data = typefacesData.fonts || [];
          break;
        case 'projects':
          const projectsData = await window.dataLoader.getProjects();
          data = projectsData.projects || [];
          break;
        case 'lettering':
          const letteringData = await window.dataLoader.getLettering();
          data = letteringData.letterings || [];
          break;
      }
      
      this.originalData = data;
      this.filteredData = [...data];
      this.currentDataType = dataType;
      
      this.updateFilterCounts(dataType);
      this.renderFilteredData(dataType);
      
    } catch (error) {
      console.error(`Error loading ${dataType} data:`, error);
    }
  }

  /**
   * Apply filters
   */
  applyFilters(dataType) {
    if (!this.originalData.length) return;

    let filtered = [...this.originalData];
    const typeFilters = this.activeFilters.get(dataType);

    if (typeFilters && typeFilters.size > 0) {
      typeFilters.forEach((values, filterKey) => {
        if (values.size > 0) {
          filtered = filtered.filter(item => {
            return this.matchesFilter(item, filterKey, values);
          });
        }
      });
    }

    this.filteredData = filtered;
    this.applySearch(dataType);
  }

  /**
   * Check if item matches filter
   */
  matchesFilter(item, filterKey, values) {
    switch (filterKey) {
      case 'type':
        return values.has(item.type);
      case 'styles':
        return this.matchesStylesFilter(item.styles, values);
      case 'variable':
        const isVariable = item.type === 'variable' || item.variableAxes;
        return values.has(isVariable ? 'yes' : 'no');
      case 'category':
        return values.has(item.category);
      case 'year':
        return this.matchesYearFilter(item.year, values);
      case 'featured':
        return values.has(item.featured ? 'yes' : 'no');
      default:
        return true;
    }
  }

  /**
   * Match styles filter
   */
  matchesStylesFilter(styles, values) {
    const styleCount = parseInt(styles) || 1;
    
    return Array.from(values).some(value => {
      switch (value) {
        case '1':
          return styleCount === 1;
        case '2-5':
          return styleCount >= 2 && styleCount <= 5;
        case '6-10':
          return styleCount >= 6 && styleCount <= 10;
        case '10+':
          return styleCount > 10;
        default:
          return false;
      }
    });
  }

  /**
   * Match year filter
   */
  matchesYearFilter(year, values) {
    const itemYear = parseInt(year) || new Date().getFullYear();
    
    return Array.from(values).some(value => {
      switch (value) {
        case '2024':
        case '2023':
        case '2022':
        case '2021':
          return itemYear === parseInt(value);
        case 'older':
          return itemYear < 2021;
        default:
          return false;
      }
    });
  }

  /**
   * Apply search
   */
  applySearch(dataType) {
    if (!this.searchQuery) {
      this.applySorting(dataType);
      return;
    }

    const query = this.searchQuery.toLowerCase();
    const searchFiltered = this.filteredData.filter(item => {
      return this.matchesSearch(item, query);
    });

    this.filteredData = searchFiltered;
    this.applySorting(dataType);
  }

  /**
   * Check if item matches search
   */
  matchesSearch(item, query) {
    const searchFields = [
      item.name,
      item.title,
      item.description?.short,
      item.description?.full,
      item.category,
      item.type
    ].filter(Boolean);

    return searchFields.some(field => 
      field.toLowerCase().includes(query)
    );
  }

  /**
   * Apply sorting
   */
  applySorting(dataType) {
    const { field, direction } = this.sortCriteria;
    
    this.filteredData.sort((a, b) => {
      let aValue = this.getSortValue(a, field);
      let bValue = this.getSortValue(b, field);
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      let result = 0;
      if (aValue < bValue) result = -1;
      else if (aValue > bValue) result = 1;
      
      return direction === 'desc' ? -result : result;
    });

    this.renderFilteredData(dataType);
  }

  /**
   * Get sort value from item
   */
  getSortValue(item, field) {
    switch (field) {
      case 'name':
      case 'title':
        return item.name || item.title || '';
      case 'styles':
        return parseInt(item.styles) || 0;
      case 'year':
        return parseInt(item.year) || 0;
      case 'category':
      case 'type':
        return item.category || item.type || '';
      case 'recent':
        return item.dateCreated || item.year || 0;
      default:
        return item[field] || '';
    }
  }

  /**
   * Update filter counts
   */
  updateFilterCounts(dataType) {
    const filters = document.querySelectorAll(`.filter-option__input[data-type="${dataType}"]`);
    
    filters.forEach(filter => {
      const { filter: filterKey, value } = filter.dataset;
      const count = this.getFilterCount(filterKey, value);
      
      const countSpan = filter.parentNode.querySelector('.filter-option__count');
      if (countSpan) {
        countSpan.textContent = count;
        countSpan.style.display = count > 0 ? 'inline' : 'none';
      }
    });
  }

  /**
   * Get count for filter option
   */
  getFilterCount(filterKey, value) {
    return this.originalData.filter(item => {
      const filterValues = new Set([value]);
      return this.matchesFilter(item, filterKey, filterValues);
    }).length;
  }

  /**
   * Render filtered data
   */
  renderFilteredData(dataType) {
    const container = document.querySelector(`[data-results="${dataType}"]`);
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Show count
    this.updateResultsCount(dataType);

    // Render items
    this.filteredData.forEach(item => {
      const itemElement = this.createItemElement(item, dataType);
      container.appendChild(itemElement);
    });

    // Show no results message if needed
    if (this.filteredData.length === 0) {
      this.showNoResults(container);
    }
  }

  /**
   * Create item element
   */
  createItemElement(item, dataType) {
    const element = document.createElement('div');
    element.className = `${dataType}-item`;
    
    switch (dataType) {
      case 'typefaces':
        element.innerHTML = this.createTypefaceHTML(item);
        break;
      case 'projects':
        element.innerHTML = this.createProjectHTML(item);
        break;
      case 'lettering':
        element.innerHTML = this.createLetteringHTML(item);
        break;
    }
    
    return element;
  }

  /**
   * Create typeface HTML
   */
  createTypefaceHTML(item) {
    return `
      <a href="typeface/${item.id}.html" class="typeface-card">
        <div class="typeface-card__preview">
          <img src="assets/svg/${item.id}.svg" alt="${item.name} preview">
        </div>
        <div class="typeface-card__info">
          <h3 class="typeface-card__name">${item.name}</h3>
          <p class="typeface-card__styles">${item.styles} styles</p>
        </div>
      </a>
    `;
  }

  /**
   * Create project HTML
   */
  createProjectHTML(item) {
    return `
      <div class="project-card">
        <div class="project-card__image">
          <img src="assets/images/${item.images[0]}" alt="${item.name}">
        </div>
        <div class="project-card__info">
          <h3 class="project-card__name">${item.name}</h3>
          <p class="project-card__description">${item.description}</p>
        </div>
      </div>
    `;
  }

  /**
   * Create lettering HTML
   */
  createLetteringHTML(item) {
    return `
      <div class="lettering-card">
        <div class="lettering-card__image">
          <img src="assets/images/${item.image}" alt="${item.title}">
        </div>
        <div class="lettering-card__info">
          <h3 class="lettering-card__title">${item.title}</h3>
          <p class="lettering-card__type">${item.type}</p>
        </div>
      </div>
    `;
  }

  /**
   * Update results count
   */
  updateResultsCount(dataType) {
    const countElement = document.querySelector(`[data-count="${dataType}"]`);
    if (countElement) {
      const total = this.originalData.length;
      const filtered = this.filteredData.length;
      countElement.textContent = `${filtered} of ${total}`;
    }
  }

  /**
   * Show no results message
   */
  showNoResults(container) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <p class="no-results__message">No results found</p>
      <button class="no-results__clear" onclick="window.filtersManager.clearAllFilters()">
        Clear all filters
      </button>
    `;
    container.appendChild(noResults);
  }

  /**
   * Clear all filters (public method)
   */
  clearAllFilters() {
    this.activeFilters.clear();
    this.searchQuery = '';
    
    // Reset all UI elements
    document.querySelectorAll('.filter-option__input').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    document.querySelectorAll('.search-controls__input').forEach(input => {
      input.value = '';
    });
    
    // Reapply with no filters
    if (this.currentDataType) {
      this.applyFilters(this.currentDataType);
    }
  }

  /**
   * Get current filter state
   */
  getCurrentState() {
    return {
      activeFilters: Object.fromEntries(this.activeFilters),
      sortCriteria: this.sortCriteria,
      searchQuery: this.searchQuery,
      resultsCount: this.filteredData.length
    };
  }
}

// Create global instance
window.filtersManager = new FiltersManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FiltersManager;
}