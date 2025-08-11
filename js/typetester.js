/**
 * Type Tester Module
 * Interactive font testing functionality with variable font support
 */

class TypeTester {
  constructor() {
    this.currentFont = null;
    this.settings = {
      fontSize: 48,
      lineHeight: 1.2,
      letterSpacing: 0,
      wordSpacing: 0,
      textAlign: 'left',
      fontStyle: 'normal',
      fontWeight: 400,
      fontWidth: 100,
      customText: 'Start Typing'
    };
    this.variableAxes = new Map();
    this.presetTexts = [
      'Start Typing',
      'The quick brown fox jumps over the lazy dog',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      '1234567890 !@#$%^&*()',
      'Typography is the art and technique of arranging type.',
      'Design is not just what it looks like and feels like. Design is how it works.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    ];
    
    this.init();
  }

  /**
   * Initialize Type Tester
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
    this.setupTypeTester();
    this.bindEvents();
    this.loadInitialFont();
    
    console.log('Type Tester initialized');
  }

  /**
   * Setup type tester interface
   */
  setupTypeTester() {
    const testerContainer = document.querySelector('.type-tester');
    if (!testerContainer) {
      console.warn('Type tester container not found');
      return;
    }

    // Create tester HTML if not exists
    if (!testerContainer.querySelector('.type-tester__preview')) {
      this.createTypeTesterHTML(testerContainer);
    }

    // Initialize controls
    this.initializeControls();
    this.initializeTextPresets();
    this.initializeVariableControls();
  }

  /**
   * Create type tester HTML structure
   */
  createTypeTesterHTML(container) {
    container.innerHTML = `
      <div class="type-tester__controls">
        <div class="type-tester__control-group">
          <label class="type-tester__label">Text</label>
          <div class="type-tester__text-controls">
            <textarea 
              class="type-tester__textarea" 
              placeholder="Start typing..."
              rows="2"
            >${this.settings.customText}</textarea>
            <div class="type-tester__presets">
              <select class="type-tester__preset-select">
                <option value="">Choose preset text...</option>
                ${this.presetTexts.map((text, index) => 
                  `<option value="${index}">${text.substring(0, 50)}${text.length > 50 ? '...' : ''}</option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="type-tester__control-group">
          <label class="type-tester__label">Size</label>
          <div class="type-tester__size-controls">
            <input 
              type="range" 
              class="type-tester__slider" 
              id="fontSize"
              min="12" 
              max="120" 
              value="${this.settings.fontSize}"
            >
            <input 
              type="number" 
              class="type-tester__number" 
              id="fontSizeNumber"
              min="12" 
              max="120" 
              value="${this.settings.fontSize}"
            >
            <span class="type-tester__unit">px</span>
          </div>
        </div>

        <div class="type-tester__control-group">
          <label class="type-tester__label">Line Height</label>
          <div class="type-tester__control-input">
            <input 
              type="range" 
              class="type-tester__slider" 
              id="lineHeight"
              min="0.8" 
              max="2.0" 
              step="0.1" 
              value="${this.settings.lineHeight}"
            >
            <span class="type-tester__value">${this.settings.lineHeight}</span>
          </div>
        </div>

        <div class="type-tester__control-group">
          <label class="type-tester__label">Letter Spacing</label>
          <div class="type-tester__control-input">
            <input 
              type="range" 
              class="type-tester__slider" 
              id="letterSpacing"
              min="-50" 
              max="200" 
              step="1" 
              value="${this.settings.letterSpacing}"
            >
            <span class="type-tester__value">${this.settings.letterSpacing}</span>
          </div>
        </div>

        <div class="type-tester__control-group">
          <label class="type-tester__label">Alignment</label>
          <div class="type-tester__alignment-controls">
            <button class="type-tester__align-btn active" data-align="left">Left</button>
            <button class="type-tester__align-btn" data-align="center">Center</button>
            <button class="type-tester__align-btn" data-align="right">Right</button>
          </div>
        </div>

        <div class="type-tester__variable-controls" style="display: none;">
          <!-- Variable font controls will be populated dynamically -->
        </div>

        <div class="type-tester__actions">
          <button class="type-tester__reset-btn">Reset</button>
          <button class="type-tester__export-btn">Export Settings</button>
        </div>
      </div>

      <div class="type-tester__preview">
        <div class="type-tester__preview-text" contenteditable="true">
          ${this.settings.customText}
        </div>
      </div>
    `;
  }

  /**
   * Initialize controls
   */
  initializeControls() {
    this.controls = {
      textarea: document.querySelector('.type-tester__textarea'),
      presetSelect: document.querySelector('.type-tester__preset-select'),
      fontSizeSlider: document.getElementById('fontSize'),
      fontSizeNumber: document.getElementById('fontSizeNumber'),
      lineHeightSlider: document.getElementById('lineHeight'),
      letterSpacingSlider: document.getElementById('letterSpacing'),
      alignmentButtons: document.querySelectorAll('.type-tester__align-btn'),
      resetButton: document.querySelector('.type-tester__reset-btn'),
      exportButton: document.querySelector('.type-tester__export-btn'),
      previewText: document.querySelector('.type-tester__preview-text')
    };

    // Update value displays
    this.updateValueDisplays();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const { controls } = this;

    // Text input
    if (controls.textarea) {
      controls.textarea.addEventListener('input', (e) => {
        this.updateText(e.target.value);
      });
    }

    if (controls.previewText) {
      controls.previewText.addEventListener('input', (e) => {
        this.updateText(e.target.textContent);
        if (controls.textarea) {
          controls.textarea.value = e.target.textContent;
        }
      });
    }

    // Preset selection
    if (controls.presetSelect) {
      controls.presetSelect.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        if (!isNaN(index) && this.presetTexts[index]) {
          this.updateText(this.presetTexts[index]);
          if (controls.textarea) {
            controls.textarea.value = this.presetTexts[index];
          }
        }
      });
    }

    // Font size controls
    if (controls.fontSizeSlider) {
      controls.fontSizeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.updateFontSize(value);
        if (controls.fontSizeNumber) {
          controls.fontSizeNumber.value = value;
        }
      });
    }

    if (controls.fontSizeNumber) {
      controls.fontSizeNumber.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.updateFontSize(value);
        if (controls.fontSizeSlider) {
          controls.fontSizeSlider.value = value;
        }
      });
    }

    // Line height
    if (controls.lineHeightSlider) {
      controls.lineHeightSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.updateLineHeight(value);
        this.updateValueDisplay('lineHeight', value);
      });
    }

    // Letter spacing
    if (controls.letterSpacingSlider) {
      controls.letterSpacingSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.updateLetterSpacing(value);
        this.updateValueDisplay('letterSpacing', value);
      });
    }

    // Alignment
    controls.alignmentButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const align = e.target.dataset.align;
        this.updateAlignment(align);
        this.updateActiveAlignment(align);
      });
    });

    // Reset button
    if (controls.resetButton) {
      controls.resetButton.addEventListener('click', () => {
        this.resetSettings();
      });
    }

    // Export button
    if (controls.exportButton) {
      controls.exportButton.addEventListener('click', () => {
        this.exportSettings();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('.type-tester')) {
        this.handleKeyboardShortcuts(e);
      }
    });
  }

  /**
   * Initialize text presets
   */
  initializeTextPresets() {
    // Presets are already set up in createTypeTesterHTML
  }

  /**
   * Initialize variable font controls
   */
  initializeVariableControls() {
    const container = document.querySelector('.type-tester__variable-controls');
    if (!container) return;

    // This will be populated when a font is loaded
    this.variableContainer = container;
  }

  /**
   * Load font and setup variable axes
   */
  async loadFont(fontData) {
    this.currentFont = fontData;
    
    // Apply font family
    this.applyFontFamily(fontData.name || fontData.id);
    
    // Setup variable axes if available
    if (fontData.variableAxes) {
      this.setupVariableAxes(fontData.variableAxes);
    } else {
      this.hideVariableControls();
    }

    // Set default text if provided
    if (fontData.defaultText) {
      this.updateText(fontData.defaultText);
    }

    console.log('Font loaded:', fontData.name);
  }

  /**
   * Apply font family to preview
   */
  applyFontFamily(fontName) {
    const preview = this.controls.previewText;
    if (preview) {
      preview.style.fontFamily = `"${fontName}", var(--font-primary)`;
    }
  }

  /**
   * Setup variable font axes controls
   */
  setupVariableAxes(axes) {
    if (!this.variableContainer || !axes) return;

    this.variableAxes.clear();
    this.variableContainer.innerHTML = '';

    Object.entries(axes).forEach(([axis, config]) => {
      const controlGroup = this.createVariableAxisControl(axis, config);
      this.variableContainer.appendChild(controlGroup);
      
      // Store axis configuration
      this.variableAxes.set(axis, {
        min: config.min,
        max: config.max,
        default: config.default,
        current: config.default
      });
    });

    this.variableContainer.style.display = 'block';
    this.updateVariableFontStyle();
  }

  /**
   * Create variable axis control
   */
  createVariableAxisControl(axis, config) {
    const group = document.createElement('div');
    group.className = 'type-tester__control-group';
    
    const axisName = this.getAxisDisplayName(axis);
    
    group.innerHTML = `
      <label class="type-tester__label">${axisName}</label>
      <div class="type-tester__control-input">
        <input 
          type="range" 
          class="type-tester__slider type-tester__variable-axis" 
          data-axis="${axis}"
          min="${config.min}" 
          max="${config.max}" 
          step="1"
          value="${config.default}"
        >
        <span class="type-tester__value">${config.default}</span>
      </div>
    `;

    // Bind axis control
    const slider = group.querySelector('.type-tester__slider');
    const valueDisplay = group.querySelector('.type-tester__value');
    
    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.updateVariableAxis(axis, value);
      valueDisplay.textContent = value;
    });

    return group;
  }

  /**
   * Get display name for variable font axis
   */
  getAxisDisplayName(axis) {
    const axisNames = {
      'wght': 'Weight',
      'wdth': 'Width',
      'slnt': 'Slant',
      'ital': 'Italic',
      'opsz': 'Optical Size',
      'grad': 'Grade',
      'CONT': 'Contrast',
      'MONO': 'Monospace'
    };
    
    return axisNames[axis] || axis.toUpperCase();
  }

  /**
   * Update variable font axis
   */
  updateVariableAxis(axis, value) {
    if (this.variableAxes.has(axis)) {
      this.variableAxes.get(axis).current = value;
      this.updateVariableFontStyle();
    }
  }

  /**
   * Update variable font style
   */
  updateVariableFontStyle() {
    const preview = this.controls.previewText;
    if (!preview) return;

    const variations = Array.from(this.variableAxes.entries())
      .map(([axis, config]) => `"${axis}" ${config.current}`)
      .join(', ');

    if (variations) {
      preview.style.fontVariationSettings = variations;
    }
  }

  /**
   * Hide variable controls
   */
  hideVariableControls() {
    if (this.variableContainer) {
      this.variableContainer.style.display = 'none';
    }
  }

  /**
   * Update text
   */
  updateText(text) {
    this.settings.customText = text;
    if (this.controls.previewText) {
      this.controls.previewText.textContent = text;
    }
  }

  /**
   * Update font size
   */
  updateFontSize(size) {
    this.settings.fontSize = Math.max(12, Math.min(120, size));
    if (this.controls.previewText) {
      this.controls.previewText.style.fontSize = `${this.settings.fontSize}px`;
    }
  }

  /**
   * Update line height
   */
  updateLineHeight(height) {
    this.settings.lineHeight = height;
    if (this.controls.previewText) {
      this.controls.previewText.style.lineHeight = height;
    }
  }

  /**
   * Update letter spacing
   */
  updateLetterSpacing(spacing) {
    this.settings.letterSpacing = spacing;
    if (this.controls.previewText) {
      this.controls.previewText.style.letterSpacing = `${spacing / 1000}em`;
    }
  }

  /**
   * Update text alignment
   */
  updateAlignment(align) {
    this.settings.textAlign = align;
    if (this.controls.previewText) {
      this.controls.previewText.style.textAlign = align;
    }
  }

  /**
   * Update active alignment button
   */
  updateActiveAlignment(align) {
    this.controls.alignmentButtons.forEach(btn => {
      if (btn.dataset.align === align) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Update value displays
   */
  updateValueDisplays() {
    this.updateValueDisplay('lineHeight', this.settings.lineHeight);
    this.updateValueDisplay('letterSpacing', this.settings.letterSpacing);
  }

  /**
   * Update individual value display
   */
  updateValueDisplay(controlId, value) {
    const slider = document.getElementById(controlId);
    if (slider) {
      const valueDisplay = slider.parentNode.querySelector('.type-tester__value');
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    }
  }

  /**
   * Load initial font (fallback)
   */
  loadInitialFont() {
    // Apply initial styles
    this.applyAllStyles();
  }

  /**
   * Apply all current styles
   */
  applyAllStyles() {
    const preview = this.controls.previewText;
    if (!preview) return;

    preview.style.fontSize = `${this.settings.fontSize}px`;
    preview.style.lineHeight = this.settings.lineHeight;
    preview.style.letterSpacing = `${this.settings.letterSpacing / 1000}em`;
    preview.style.textAlign = this.settings.textAlign;
    
    // Apply variable font settings if any
    this.updateVariableFontStyle();
  }

  /**
   * Reset all settings
   */
  resetSettings() {
    // Reset to defaults
    this.settings = {
      fontSize: 48,
      lineHeight: 1.2,
      letterSpacing: 0,
      wordSpacing: 0,
      textAlign: 'left',
      fontStyle: 'normal',
      fontWeight: 400,
      fontWidth: 100,
      customText: this.currentFont?.defaultText || 'Start Typing'
    };

    // Reset variable axes
    this.variableAxes.forEach((config, axis) => {
      config.current = config.default;
    });

    // Update UI
    this.updateControlValues();
    this.applyAllStyles();
    this.updateText(this.settings.customText);
  }

  /**
   * Update control values
   */
  updateControlValues() {
    const { controls } = this;

    if (controls.fontSizeSlider) {
      controls.fontSizeSlider.value = this.settings.fontSize;
    }
    if (controls.fontSizeNumber) {
      controls.fontSizeNumber.value = this.settings.fontSize;
    }
    if (controls.lineHeightSlider) {
      controls.lineHeightSlider.value = this.settings.lineHeight;
    }
    if (controls.letterSpacingSlider) {
      controls.letterSpacingSlider.value = this.settings.letterSpacing;
    }
    if (controls.textarea) {
      controls.textarea.value = this.settings.customText;
    }

    // Update variable axes
    document.querySelectorAll('.type-tester__variable-axis').forEach(slider => {
      const axis = slider.dataset.axis;
      if (this.variableAxes.has(axis)) {
        slider.value = this.variableAxes.get(axis).current;
      }
    });

    this.updateValueDisplays();
    this.updateActiveAlignment(this.settings.textAlign);
  }

  /**
   * Export current settings
   */
  exportSettings() {
    const settings = {
      ...this.settings,
      font: this.currentFont?.name,
      variableAxes: Object.fromEntries(
        Array.from(this.variableAxes.entries()).map(([axis, config]) => [
          axis, 
          config.current
        ])
      )
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
      .then(() => {
        console.log('Settings exported to clipboard');
        this.showNotification('Settings copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy settings:', err);
        this.showNotification('Failed to copy settings');
      });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          this.resetSettings();
          break;
        case 'e':
          e.preventDefault();
          this.exportSettings();
          break;
        case '=':
        case '+':
          e.preventDefault();
          this.updateFontSize(this.settings.fontSize + 2);
          this.updateControlValues();
          break;
        case '-':
          e.preventDefault();
          this.updateFontSize(this.settings.fontSize - 2);
          this.updateControlValues();
          break;
      }
    }
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = 'type-tester__notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-black);
      color: var(--color-white);
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * Get current settings
   */
  getCurrentSettings() {
    return {
      ...this.settings,
      variableAxes: Object.fromEntries(this.variableAxes)
    };
  }

  /**
   * Destroy type tester
   */
  destroy() {
    // Remove event listeners and clean up
    this.variableAxes.clear();
    console.log('Type Tester destroyed');
  }
}

// Create global instance
window.typeTester = new TypeTester();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TypeTester;
}