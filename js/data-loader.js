/**
 * Data Loader Module
 * Handles loading and caching of JSON data files
 */

class DataLoader {
  constructor() {
    this.cache = new Map();
    this.basePath = './data/';
  }

  /**
   * Load JSON data with caching
   * @param {string} filename - The JSON filename (without extension)
   * @returns {Promise<Object>} Parsed JSON data
   */
  async loadData(filename) {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const response = await fetch(`${this.basePath}${filename}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      this.cache.set(filename, data);
      
      return data;
    } catch (error) {
      console.error(`Error loading ${filename}.json:`, error);
      
      // Return fallback data structure
      return this.getFallbackData(filename);
    }
  }

  /**
   * Load multiple data files in parallel
   * @param {string[]} filenames - Array of JSON filenames
   * @returns {Promise<Object>} Object with filename as key and data as value
   */
  async loadMultiple(filenames) {
    const promises = filenames.map(filename => 
      this.loadData(filename).then(data => ({ [filename]: data }))
    );
    
    const results = await Promise.all(promises);
    return Object.assign({}, ...results);
  }

  /**
   * Get fallback data for when loading fails
   * @param {string} filename - The filename that failed to load
   * @returns {Object} Fallback data structure
   */
  getFallbackData(filename) {
    switch (filename) {
      case 'typefaces':
        return { fonts: [] };
      case 'projects':
        return { projects: [], categories: [] };
      case 'lettering':
        return { letterings: [], types: [] };
      case 'site-config':
        return {
          site: {
            title: 'The Loveprinting Machine Type Foundry',
            description: 'Type design and custom lettering'
          },
          navigation: { main: [], footer: [] }
        };
      default:
        return {};
    }
  }

  /**
   * Preload all data files
   * @returns {Promise<Object>} All loaded data
   */
  async preloadAll() {
    const dataFiles = ['typefaces', 'projects', 'lettering', 'site-config'];
    return await this.loadMultiple(dataFiles);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cached data without loading
   * @param {string} filename - The filename to get from cache
   * @returns {Object|null} Cached data or null
   */
  getCached(filename) {
    return this.cache.get(filename) || null;
  }

  /**
   * Check if data is cached
   * @param {string} filename - The filename to check
   * @returns {boolean} True if cached
   */
  isCached(filename) {
    return this.cache.has(filename);
  }
}

/**
 * Font Data Helper Class
 * Provides methods for working with font data
 */
class FontDataHelper {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  /**
   * Get all fonts
   * @returns {Promise<Array>} Array of font objects
   */
  async getAllFonts() {
    const data = await this.dataLoader.loadData('typefaces');
    return data.fonts || [];
  }

  /**
   * Get font by ID
   * @param {string} fontId - The font ID
   * @returns {Promise<Object|null>} Font object or null
   */
  async getFontById(fontId) {
    const fonts = await this.getAllFonts();
    return fonts.find(font => font.id === fontId) || null;
  }

  /**
   * Filter fonts by type
   * @param {string} type - Font type ('static' or 'variable')
   * @returns {Promise<Array>} Filtered font array
   */
  async getFontsByType(type) {
    const fonts = await this.getAllFonts();
    return fonts.filter(font => font.type === type);
  }

  /**
   * Get fonts used in specific project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of font objects used in project
   */
  async getFontsForProject(projectId) {
    const [fonts, projects] = await Promise.all([
      this.getAllFonts(),
      this.dataLoader.loadData('projects')
    ]);
    
    const project = projects.projects.find(p => p.id === projectId);
    if (!project) return [];
    
    return fonts.filter(font => 
      project.usedFonts.includes(font.id)
    );
  }
}

/**
 * Project Data Helper Class
 * Provides methods for working with project data
 */
class ProjectDataHelper {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  /**
   * Get all projects
   * @returns {Promise<Array>} Array of project objects
   */
  async getAllProjects() {
    const data = await this.dataLoader.loadData('projects');
    return data.projects || [];
  }

  /**
   * Get projects by category
   * @param {string} category - Project category
   * @returns {Promise<Array>} Filtered project array
   */
  async getProjectsByCategory(category) {
    const projects = await this.getAllProjects();
    if (category === 'all') return projects;
    return projects.filter(project => project.category === category);
  }

  /**
   * Get projects using specific font
   * @param {string} fontId - Font ID
   * @returns {Promise<Array>} Projects using the font
   */
  async getProjectsUsingFont(fontId) {
    const projects = await this.getAllProjects();
    return projects.filter(project => 
      project.usedFonts.includes(fontId)
    );
  }

  /**
   * Get featured projects
   * @returns {Promise<Array>} Featured projects
   */
  async getFeaturedProjects() {
    const projects = await this.getAllProjects();
    return projects.filter(project => project.featured);
  }

  /**
   * Get projects grouped by year
   * @returns {Promise<Object>} Projects grouped by year
   */
  async getProjectsByYear() {
    const projects = await this.getAllProjects();
    return projects.reduce((acc, project) => {
      const year = project.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(project);
      return acc;
    }, {});
  }
}

/**
 * Lettering Data Helper Class
 * Provides methods for working with lettering data
 */
class LetteringDataHelper {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  /**
   * Get all lettering projects
   * @returns {Promise<Array>} Array of lettering objects
   */
  async getAllLettering() {
    const data = await this.dataLoader.loadData('lettering');
    return data.letterings || [];
  }

  /**
   * Get lettering by type
   * @param {string} type - Lettering type
   * @returns {Promise<Array>} Filtered lettering array
   */
  async getLetteringByType(type) {
    const letterings = await this.getAllLettering();
    if (type === 'all') return letterings;
    return letterings.filter(lettering => lettering.type === type);
  }

  /**
   * Get featured lettering
   * @returns {Promise<Array>} Featured lettering projects
   */
  async getFeaturedLettering() {
    const letterings = await this.getAllLettering();
    return letterings.filter(lettering => lettering.featured);
  }
}

// Create global instances
const dataLoader = new DataLoader();
const fontData = new FontDataHelper(dataLoader);
const projectData = new ProjectDataHelper(dataLoader);
const letteringData = new LetteringDataHelper(dataLoader);

// Export for module usage (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataLoader,
    FontDataHelper,
    ProjectDataHelper,
    LetteringDataHelper,
    dataLoader,
    fontData,
    projectData,
    letteringData
  };
}

// Global namespace for browser usage
window.DataLoader = {
  dataLoader,
  fontData,
  projectData,
  letteringData
};