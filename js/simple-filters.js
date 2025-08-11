/**
 * Simple Filters Component Module
 * Universal component for filtering content with simple button interface
 * Can be configured for different data types and filter categories
 */

class SimpleFiltersComponent {
  constructor(config) {
    // Required configuration
    this.containerId = config.containerId || 'filtersContainer';
    this.gridId = config.gridId || 'contentGrid';
    this.dataType = config.dataType || 'items';
    
    // Filter configuration
    this.filterConfig = config.filters || [];
    this.dataLoader = config.dataLoader || null;
    this.fallbackData = config.fallbackData || [];
    
    // Rendering configuration
    this.cardRenderer = config.cardRenderer || this.defaultCardRenderer.bind(this);
    this.filterRenderer = config.filterRenderer || this.defaultFilterRenderer.bind(this);
    
    // State
    this.data = [];
    this.currentFilter = 'all';
    this.filteredData = [];
    
    // Event callbacks
    this.onFilterChange = config.onFilterChange || null;
    this.onDataLoad = config.onDataLoad || null;
    this.onRender = config.onRender || null;
    
    this.init();
  }

  /**
   * Initialize the component
   */
  async init() {
    try {
      await this.loadData();
      this.render();
      this.bindEvents();
      
      if (this.onDataLoad) {
        this.onDataLoad(this.data);
      }
    } catch (error) {
      console.error('Error initializing SimpleFiltersComponent:', error);
      this.handleError(error);
    }
  }

  /**
   * Load data from configured source
   */
  async loadData() {
    try {
      if (this.dataLoader && typeof this.dataLoader === 'function') {
        this.data = await this.dataLoader();
      } else if (this.fallbackData && this.fallbackData.length > 0) {
        this.data = this.fallbackData;
      } else {
        console.warn('No data loader or fallback data provided');
        this.data = [];
      }
      
      this.filteredData = [...this.data];
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = this.fallbackData || [];
      this.filteredData = [...this.data];
    }
  }

  /**
   * Render the complete component
   */
  render() {
    this.renderFilters();
    this.renderContent();
    
    if (this.onRender) {
      this.onRender(this.filteredData);
    }
  }

  /**
   * Render filter buttons
   */
  renderFilters() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Filter container with ID '${this.containerId}' not found`);
      return;
    }

    const filtersHTML = this.filterRenderer(this.filterConfig);
    container.innerHTML = filtersHTML;
  }

  /**
   * Default filter renderer - creates simple button interface
   */
  defaultFilterRenderer(filterConfig) {
    const buttons = filterConfig.map(filter => 
      `<button class="simple-filter-btn ${filter.value === 'all' ? 'active' : ''}" 
               data-filter="${filter.value}">
         ${filter.label}
       </button>`
    ).join('');

    return `
      <div class="simple-filters__buttons">
        ${buttons}
      </div>
    `;
  }

  /**
   * Render filtered content
   */
  renderContent() {
    const container = document.getElementById(this.gridId);
    if (!container) {
      console.error(`Content grid with ID '${this.gridId}' not found`);
      return;
    }

    container.innerHTML = '';

    if (this.filteredData.length === 0) {
      this.renderNoResults(container);
      return;
    }

    this.filteredData.forEach(item => {
      const cardElement = this.cardRenderer(item);
      container.appendChild(cardElement);
    });
  }

  /**
   * Default card renderer - creates basic card structure
   */
  defaultCardRenderer(item) {
    const card = document.createElement('div');
    card.className = 'filter-item-card';
    
    card.innerHTML = `
      <div class="filter-item-card__content">
        <h3 class="filter-item-card__title">${item.name || item.title || 'Untitled'}</h3>
        <p class="filter-item-card__description">${item.description || ''}</p>
        <div class="filter-item-card__meta">
          <span class="filter-item-card__category">${item.category || ''}</span>
          <span class="filter-item-card__year">${item.year || ''}</span>
        </div>
      </div>
    `;
    
    // Add click handler if link exists
    if (item.link) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.open(item.link, '_blank');
      });
    }
    
    return card;
  }

  /**
   * Render no results state
   */
  renderNoResults(container) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <p class="no-results__message">No ${this.dataType} found for this category.</p>
      <button class="no-results__clear" onclick="this.clearFilter()">
        Show All
      </button>
    `;
    container.appendChild(noResults);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('simple-filter-btn')) {
        this.handleFilterClick(e.target);
      }
    });
  }

  /**
   * Handle filter button click
   */
  handleFilterClick(button) {
    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('.simple-filter-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Update current filter
    const newFilter = button.dataset.filter;
    this.setFilter(newFilter);
  }

  /**
   * Set filter and update content
   */
  setFilter(filterValue) {
    this.currentFilter = filterValue;
    this.applyFilter();
    
    if (this.onFilterChange) {
      this.onFilterChange(filterValue, this.filteredData);
    }
  }

  /**
   * Apply current filter to data
   */
  applyFilter() {
    if (this.currentFilter === 'all') {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item => {
        return this.matchesFilter(item, this.currentFilter);
      });
    }
    
    this.renderContent();
  }

  /**
   * Check if item matches the current filter
   */
  matchesFilter(item, filterValue) {
    // Default matching logic - checks category property
    // Can be overridden for custom matching logic
    return item.category === filterValue;
  }

  /**
   * Clear filter and show all items
   */
  clearFilter() {
    this.setFilter('all');
    
    // Update UI
    const allButtons = document.querySelectorAll('.simple-filter-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    const allButton = document.querySelector('.simple-filter-btn[data-filter="all"]');
    if (allButton) {
      allButton.classList.add('active');
    }
  }

  /**
   * Add new data items
   */
  addData(newItems) {
    if (Array.isArray(newItems)) {
      this.data = [...this.data, ...newItems];
    } else {
      this.data.push(newItems);
    }
    this.applyFilter();
  }

  /**
   * Update data completely
   */
  updateData(newData) {
    this.data = Array.isArray(newData) ? newData : [];
    this.applyFilter();
  }

  /**
   * Get current filter state
   */
  getState() {
    return {
      currentFilter: this.currentFilter,
      totalItems: this.data.length,
      filteredItems: this.filteredData.length,
      data: this.data,
      filteredData: this.filteredData
    };
  }

  /**
   * Handle errors gracefully
   */
  handleError(error) {
    console.error('SimpleFiltersComponent error:', error);
    
    const container = document.getElementById(this.gridId);
    if (container) {
      container.innerHTML = `
        <div class="filter-error">
          <p>Sorry, there was an error loading the content.</p>
          <button onclick="location.reload()">Reload Page</button>
        </div>
      `;
    }
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.removeEventListener('click', this.handleFilterClick);
      container.innerHTML = '';
    }
    
    const gridContainer = document.getElementById(this.gridId);
    if (gridContainer) {
      gridContainer.innerHTML = '';
    }
  }
}

/**
 * Factory functions for common configurations
 */

/**
 * Create filters for projects/fonts-in-use page
 */
function createProjectsFilter(config = {}) {
  const defaultConfig = {
    containerId: 'projectFilters',
    gridId: 'projectsGrid',
    dataType: 'projects',
    filters: [
      { value: 'all', label: 'All' },
      { value: 'branding', label: 'Branding' },
      { value: 'editorial', label: 'Editorial' },
      { value: 'web', label: 'Web' },
      { value: 'animation', label: 'Animation' },
      { value: 'system', label: 'Design System' }
    ]
  };
  
  return new SimpleFiltersComponent({ ...defaultConfig, ...config });
}

/**
 * Create filters for lettering page
 */
function createLetteringFilter(config = {}) {
  const defaultConfig = {
    containerId: 'letteringFilters',
    gridId: 'letteringGrid',
    dataType: 'lettering',
    filters: [
      { value: 'all', label: 'All' },
      { value: 'lettering', label: 'Lettering' },
      { value: 'poster', label: 'Poster' },
      { value: 'logo', label: 'Logo' },
      { value: 'animation', label: 'Animation' },
      { value: 'playfaces', label: 'Playfaces' }
    ]
  };
  
  return new SimpleFiltersComponent({ ...defaultConfig, ...config });
}

/**
 * Create filters for typefaces page
 */
function createTypefacesFilter(config = {}) {
  const defaultConfig = {
    containerId: 'typefaceFilters',
    gridId: 'typefacesGrid',
    dataType: 'typefaces',
    filters: [
      { value: 'all', label: 'All' },
      { value: 'serif', label: 'Serif' },
      { value: 'sans-serif', label: 'Sans Serif' },
      { value: 'display', label: 'Display' },
      { value: 'script', label: 'Script' },
      { value: 'mono', label: 'Monospace' }
    ]
  };
  
  return new SimpleFiltersComponent({ ...defaultConfig, ...config });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SimpleFiltersComponent,
    createProjectsFilter,
    createLetteringFilter,
    createTypefacesFilter
  };
}

// Global namespace for browser usage
if (typeof window !== 'undefined') {
  window.SimpleFiltersComponent = SimpleFiltersComponent;
  window.createProjectsFilter = createProjectsFilter;
  window.createLetteringFilter = createLetteringFilter;
  window.createTypefacesFilter = createTypefacesFilter;
}