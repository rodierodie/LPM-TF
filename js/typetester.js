/**
 * Typetester Module
 * Handles interactive font testing functionality
 */

class Typetester {
  constructor(options = {}) {
    this.options = {
      container: '#typetester',
      displayElement: '#displayText',
      textInput: '#customText',
      fontSizeRange: '#fontSize',
      fontWeightRange: '#fontWeight',
      letterSpacingRange: '#letterSpacing',
      lineHeightRange: '#lineHeight',
      fontStyleSelect: '#fontStyle',
      defaultText: 'Start typing',
      minFontSize: 12,
      maxFontSize: 120,
      minWeight: 100,
      maxWeight: 900,
      ...options
    };
    
    this.currentFont = null;
    this.isVariable = false;
    this.variableAxes = {};
    
    this.init();
  }

  /**
   * Initialize the typetester
   */
  init() {
    this.bindEvents();
    this.loadInitialValues();
  }

  /**
   * Set the current font data
   * @param {Object} fontData - Font data object
   */
  setFont(fontData) {
    this.currentFont = fontData;
    this.isVariable = fontData.type === 'variable';
    this.variableAxes = fontData.variableAxes || {};
    
    this.updateFontFamily();
    this.updateVariableControls();
    this.updateDisplay();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Text input
    const textInput = document.querySelector(this.options.textInput);
    if (textInput) {
      textInput.addEventListener('input', () => this.updateDisplayText());
    }

    // Font size
    const fontSizeRange = document.querySelector(this.options.fontSizeRange);
    if (fontSizeRange) {
      fontSizeRange.addEventListener('input', () => this.updateFontSize());
    }

    // Font weight (for variable fonts)
    const fontWeightRange = document.querySelector(this.options.fontWeightRange);
    if (fontWeightRange) {
      fontWeightRange.addEventListener('input', () => this.updateFontWeight());
    }

    // Letter spacing
    const letterSpacingRange = document.querySelector(this.options.letterSpacingRange);
    if (letterSpacingRange) {
      letterSpacingRange.addEventListener('input', () => this.updateLetterSpacing());
    }

    // Line height
    const lineHeightRange = document.querySelector(this.options.lineHeightRange);
    if (lineHeightRange) {
      lineHeightRange.addEventListener('input', () => this.updateLineHeight());
    }

    // Font style select
    const fontStyleSelect = document.querySelector(this.options.fontStyleSelect);
    if (fontStyleSelect) {
      fontStyleSelect.addEventListener('change', () => this.updateFontStyle());
    }
  }

  /**
   * Load initial values from inputs
   */
  loadInitialValues() {
    this.updateDisplayText();
    this.updateFontSize();
    this.updateFontWeight();
    this.updateLetterSpacing();
    this.updateLineHeight();
    this.updateFontStyle();
  }

  /**
   * Update display text
   */
  updateDisplayText() {
    const textInput = document.querySelector(this.options.textInput);
    const displayElement = document.querySelector(this.options.displayElement);
    
    if (textInput && displayElement) {
      const text = textInput.value || this.options.defaultText;
      displayElement.textContent = text;
    }
  }

  /**
   * Update font size
   */
  updateFontSize() {
    const fontSizeRange = document.querySelector(this.options.fontSizeRange);
    const displayElement = document.querySelector(this.options.displayElement);
    const valueDisplay = document.querySelector('#fontSizeValue');
    
    if (fontSizeRange && displayElement) {
      const size = fontSizeRange.value + 'px';
      displayElement.style.fontSize = size;
      
      if (valueDisplay) {
        valueDisplay.textContent = size;
      }
    }
  }

  /**
   * Update font weight (for variable fonts)
   */
  updateFontWeight() {
    const fontWeightRange = document.querySelector(this.options.fontWeightRange);
    const displayElement = document.querySelector(this.options.displayElement);
    const valueDisplay = document.querySelector('#fontWeightValue');
    
    if (fontWeightRange && displayElement) {
      const weight = fontWeightRange.value;
      
      if (this.isVariable && this.variableAxes.wght) {
        // Use CSS font-variation-settings for variable fonts
        this.updateVariationSettings();
      } else {
        displayElement.style.fontWeight = weight;
      }
      
      if (valueDisplay) {
        valueDisplay.textContent = weight;
      }
    }
  }

  /**
   * Update letter spacing
   */
  updateLetterSpacing() {
    const letterSpacingRange = document.querySelector(this.options.letterSpacingRange);
    const displayElement = document.querySelector(this.options.displayElement);
    const valueDisplay = document.querySelector('#letterSpacingValue');
    
    if (letterSpacingRange && displayElement) {
      const spacing = letterSpacingRange.value + 'em';
      displayElement.style.letterSpacing = spacing;
      
      if (valueDisplay) {
        valueDisplay.textContent = spacing;
      }
    }
  }

  /**
   * Update line height
   */
  updateLineHeight() {
    const lineHeightRange = document.querySelector(this.options.lineHeightRange);
    const displayElement = document.querySelector(this.options.displayElement);
    const valueDisplay = document.querySelector('#lineHeightValue');
    
    if (lineHeightRange && displayElement) {
      const lineHeight = lineHeightRange.value;
      displayElement.style.lineHeight = lineHeight;
      
      if (valueDisplay) {
        valueDisplay.textContent = lineHeight;
      }
    }
  }

  /**
   * Update font style
   */
  updateFontStyle() {
    const fontStyleSelect = document.querySelector(this.options.fontStyleSelect);
    const displayElement = document.querySelector(this.options.displayElement);
    
    if (fontStyleSelect && displayElement) {
      const style = fontStyleSelect.value;
      
      // Map style names to CSS properties
      const styleMap = {
        'thin': { fontWeight: 100 },
        'light': { fontWeight: 200 },
        'regular': { fontWeight: 400 },
        'medium': { fontWeight: 500 },
        'semibold': { fontWeight: 600 },
        'bold': { fontWeight: 700 },
        'black': { fontWeight: 900 }
      };
      
      if (styleMap[style]) {
        Object.assign(displayElement.style, styleMap[style]);
      }
    }
  }

  /**
   * Update font family
   */
  updateFontFamily() {
    const displayElement = document.querySelector(this.options.displayElement);
    
    if (displayElement && this.currentFont) {
      displayElement.style.fontFamily = `"${this.currentFont.name}", var(--font-secondary)`;
    }
  }

  /**
   * Update variable font settings
   */
  updateVariationSettings() {
    const displayElement = document.querySelector(this.options.displayElement);
    
    if (!displayElement || !this.isVariable) return;
    
    const settings = [];
    
    // Weight axis
    if (this.variableAxes.wght) {
      const fontWeightRange = document.querySelector(this.options.fontWeightRange);
      if (fontWeightRange) {
        settings.push(`"wght" ${fontWeightRange.value}`);
      }
    }
    
    // Width axis
    if (this.variableAxes.wdth) {
      const widthRange = document.querySelector('#fontWidth');
      if (widthRange) {
        settings.push(`"wdth" ${widthRange.value}`);
      }
    }
    
    // Apply variation settings
    if (settings.length > 0) {
      displayElement.style.fontVariationSettings = settings.join(', ');
    }
  }

  /**
   * Update variable controls based on current font
   */
  updateVariableControls() {
    const container = document.querySelector(this.options.container);
    if (!container) return;
    
    // Show/hide variable controls
    const variableControls = container.querySelectorAll('.variable-control');
    variableControls.forEach(control => {
      control.style.display = this.isVariable ? 'flex' : 'none';
    });
    
    // Update range limits for variable axes
    if (this.isVariable && this.variableAxes) {
      this.updateRangeLimits();
    }
  }

  /**
   * Update range input limits based on variable axes
   */
  updateRangeLimits() {
    // Weight axis
    if (this.variableAxes.wght) {
      const fontWeightRange = document.querySelector(this.options.fontWeightRange);
      if (fontWeightRange) {
        fontWeightRange.min = this.variableAxes.wght.min;
        fontWeightRange.max = this.variableAxes.wght.max;
        fontWeightRange.value = this.variableAxes.wght.default;
      }
    }
    
    // Width axis
    if (this.variableAxes.wdth) {
      const widthRange = document.querySelector('#fontWidth');
      if (widthRange) {
        widthRange.min = this.variableAxes.wdth.min;
        widthRange.max = this.variableAxes.wdth.max;
        widthRange.value = this.variableAxes.wdth.default;
      }
    }
  }

  /**
   * Reset all controls to default values
   */
  reset() {
    const textInput = document.querySelector(this.options.textInput);
    const fontSizeRange = document.querySelector(this.options.fontSizeRange);
    const fontWeightRange = document.querySelector(this.options.fontWeightRange);
    const letterSpacingRange = document.querySelector(this.options.letterSpacingRange);
    const lineHeightRange = document.querySelector(this.options.lineHeightRange);
    
    if (textInput) textInput.value = this.options.defaultText;
    if (fontSizeRange) fontSizeRange.value = 48;
    if (fontWeightRange) fontWeightRange.value = 400;
    if (letterSpacingRange) letterSpacingRange.value = 0;
    if (lineHeightRange) lineHeightRange.value = 1.2;
    
    this.loadInitialValues();
  }

  /**
   * Update entire display
   */
  updateDisplay() {
    this.updateDisplayText();
    this.updateFontFamily();
    this.updateFontSize();
    this.updateFontWeight();
    this.updateLetterSpacing();
    this.updateLineHeight();
    this.updateFontStyle();
  }

  /**
   * Generate shareable URL with current settings
   * @returns {string} URL with encoded settings
   */
  getShareableURL() {
    const params = new URLSearchParams();
    
    const textInput = document.querySelector(this.options.textInput);
    const fontSizeRange = document.querySelector(this.options.fontSizeRange);
    const fontWeightRange = document.querySelector(this.options.fontWeightRange);
    const letterSpacingRange = document.querySelector(this.options.letterSpacingRange);
    const lineHeightRange = document.querySelector(this.options.lineHeightRange);
    
    if (textInput) params.set('text', textInput.value);
    if (fontSizeRange) params.set('size', fontSizeRange.value);
    if (fontWeightRange) params.set('weight', fontWeightRange.value);
    if (letterSpacingRange) params.set('spacing', letterSpacingRange.value);
    if (lineHeightRange) params.set('height', lineHeightRange.value);
    
    if (this.currentFont) {
      params.set('font', this.currentFont.id);
    }
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  /**
   * Load settings from URL parameters
   */
  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    const textInput = document.querySelector(this.options.textInput);
    const fontSizeRange = document.querySelector(this.options.fontSizeRange);
    const fontWeightRange = document.querySelector(this.options.fontWeightRange);
    const letterSpacingRange = document.querySelector(this.options.letterSpacingRange);
    const lineHeightRange = document.querySelector(this.options.lineHeightRange);
    
    if (params.has('text') && textInput) {
      textInput.value = params.get('text');
    }
    if (params.has('size') && fontSizeRange) {
      fontSizeRange.value = params.get('size');
    }
    if (params.has('weight') && fontWeightRange) {
      fontWeightRange.value = params.get('weight');
    }
    if (params.has('spacing') && letterSpacingRange) {
      letterSpacingRange.value = params.get('spacing');
    }
    if (params.has('height') && lineHeightRange) {
      lineHeightRange.value = params.get('height');
    }
    
    this.updateDisplay();
  }
}

/**
 * Font Loader for Typetester
 * Handles loading of demo font files
 */
class TypetesterFontLoader {
  constructor() {
    this.loadedFonts = new Set();
    this.basePath = './fonts-protected/';
  }

  /**
   * Load a font for the typetester
   * @param {Object} fontData - Font data object
   * @returns {Promise<boolean>} Success status
   */
  async loadFont(fontData) {
    if (this.loadedFonts.has(fontData.id)) {
      return true;
    }

    try {
      if (fontData.fontFiles && fontData.fontFiles.demo) {
        const fontFace = new FontFace(
          fontData.name,
          `url("${this.basePath}${fontData.fontFiles.demo}")`
        );
        
        await fontFace.load();
        document.fonts.add(fontFace);
        
        this.loadedFonts.add(fontData.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to load font ${fontData.name}:`, error);
      return false;
    }
  }

  /**
   * Preload multiple fonts
   * @param {Array} fontDataArray - Array of font data objects
   * @returns {Promise<Array>} Array of success statuses
   */
  async preloadFonts(fontDataArray) {
    const promises = fontDataArray.map(fontData => this.loadFont(fontData));
    return await Promise.all(promises);
  }

  /**
   * Check if font is loaded
   * @param {string} fontId - Font ID
   * @returns {boolean} Load status
   */
  isFontLoaded(fontId) {
    return this.loadedFonts.has(fontId);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Typetester, TypetesterFontLoader };
}

// Global namespace for browser usage
window.Typetester = { Typetester, TypetesterFontLoader };