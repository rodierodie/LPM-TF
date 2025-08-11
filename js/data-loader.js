/**
 * Data Loader Module
 * Handles loading and caching of JSON data files
 */

class DataLoader {
  constructor() {
    this.cache = new Map();
    this.baseUrl = 'data/';
  }

  /**
   * Load JSON data with caching
   * @param {string} filename - Name of the JSON file (without extension)
   * @returns {Promise<Object>} Parsed JSON data
   */
  async loadData(filename) {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const response = await fetch(`${this.baseUrl}${filename}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the data
      this.cache.set(filename, data);
      
      return data;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      // Return empty structure based on filename
      return this.getEmptyStructure(filename);
    }
  }

  /**
   * Load multiple data files
   * @param {string[]} filenames - Array of filenames
   * @returns {Promise<Object>} Object with loaded data
   */
  async loadMultiple(filenames) {
    const promises = filenames.map(filename => 
      this.loadData(filename).then(data => ({ [filename]: data }))
    );

    const results = await Promise.all(promises);
    return Object.assign({}, ...results);
  }

  /**
   * Get typefaces data
   * @returns {Promise<Object>} Typefaces data
   */
  async getTypefaces() {
    return this.loadData('typefaces');
  }

  /**
   * Get projects data
   * @returns {Promise<Object>} Projects data
   */
  async getProjects() {
    return this.loadData('projects');
  }

  /**
   * Get lettering data
   * @returns {Promise<Object>} Lettering data
   */
  async getLettering() {
    return this.loadData('lettering');
  }

  /**
   * Get site configuration
   * @returns {Promise<Object>} Site config data
   */
  async getSiteConfig() {
    return this.loadData('site-config');
  }

  /**
   * Get specific typeface by ID
   * @param {string} id - Typeface ID
   * @returns {Promise<Object|null>} Typeface data or null if not found
   */
  async getTypefaceById(id) {
    const typefaces = await this.getTypefaces();
    return typefaces.fonts?.find(font => font.id === id) || null;
  }

  /**
   * Get projects that use a specific typeface
   * @param {string} typefaceId - Typeface ID
   * @returns {Promise<Array>} Array of projects
   */
  async getProjectsByTypeface(typefaceId) {
    const projects = await this.getProjects();
    return projects.projects?.filter(project => 
      project.usedFonts?.includes(typefaceId)
    ) || [];
  }

  /**
   * Search typefaces by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching typefaces
   */
  async searchTypefaces(query) {
    const typefaces = await this.getTypefaces();
    const fonts = typefaces.fonts || [];
    
    if (!query) return fonts;
    
    const lowercaseQuery = query.toLowerCase();
    
    return fonts.filter(font => 
      font.name?.toLowerCase().includes(lowercaseQuery) ||
      font.description?.short?.toLowerCase().includes(lowercaseQuery) ||
      font.description?.full?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Filter projects by category
   * @param {string} category - Project category
   * @returns {Promise<Array>} Array of projects in category
   */
  async getProjectsByCategory(category) {
    const projects = await this.getProjects();
    return projects.projects?.filter(project => 
      project.category === category
    ) || [];
  }

  /**
   * Filter lettering by type
   * @param {string} type - Lettering type
   * @returns {Promise<Array>} Array of lettering projects
   */
  async getLetteringByType(type) {
    const lettering = await this.getLettering();
    return lettering.letterings?.filter(item => 
      item.type === type
    ) || [];
  }

  /**
   * Get featured projects
   * @returns {Promise<Array>} Array of featured projects
   */
  async getFeaturedProjects() {
    const projects = await this.getProjects();
    return projects.projects?.filter(project => project.featured) || [];
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Preload all essential data
   * @returns {Promise<Object>} All loaded data
   */
  async preloadEssentials() {
    try {
      const data = await this.loadMultiple([
        'typefaces',
        'projects', 
        'site-config'
      ]);
      
      console.log('Essential data preloaded successfully');
      return data;
    } catch (error) {
      console.error('Error preloading essential data:', error);
      return {};
    }
  }

  /**
   * Get empty structure for fallback
   * @param {string} filename - Filename to get structure for
   * @returns {Object} Empty structure
   */
  getEmptyStructure(filename) {
    const structures = {
      'typefaces': { fonts: [] },
      'projects': { projects: [] },
      'lettering': { letterings: [], types: [] },
      'site-config': {
        site: { title: 'The Loveprinting Machine', author: '', description: '' },
        about: { text: '', image: '' },
        usp: { title: '', description: '', linkText: '', linkUrl: '' },
        navigation: { main: [], footer: [] }
      }
    };

    return structures[filename] || {};
  }

  /**
   * Validate data structure
   * @param {Object} data - Data to validate
   * @param {string} type - Type of data
   * @returns {boolean} Is valid
   */
  validateData(data, type) {
    switch (type) {
      case 'typefaces':
        return data && Array.isArray(data.fonts);
      case 'projects':
        return data && Array.isArray(data.projects);
      case 'lettering':
        return data && Array.isArray(data.letterings);
      case 'site-config':
        return data && data.site && data.navigation;
      default:
        return true;
    }
  }

  /**
   * Refresh data (clear cache and reload)
   * @param {string} filename - Specific file to refresh, or null for all
   */
  async refreshData(filename = null) {
    if (filename) {
      this.cache.delete(filename);
      return this.loadData(filename);
    } else {
      this.clearCache();
      return this.preloadEssentials();
    }
  }
}

// Create global instance
window.dataLoader = new DataLoader();

// Auto-preload essential data when module loads
document.addEventListener('DOMContentLoaded', () => {
  window.dataLoader.preloadEssentials();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}