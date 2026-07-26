
/**
 * Base Widget Class
 * All widgets should extend this class
 */

export class BaseWidget {
  /**
   * Create a widget
   * @param {object} options
   * @param {string} options.className - CSS class for the widget container
   */
  constructor(options = {}) {
    this.className = options.className || 'widget';
    this.container = null;
    this.eventListener = null;
  }

  /**
   * Render the widget
   * @returns {HTMLElement}
   */
  render() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `card ${this.className}`;
      this.container.setAttribute('role', 'region');
    }

    this.container.innerHTML = this.getSkeletonHTML();

    this.loadData()
      .then(data => {
        this.container.innerHTML = this.getContentHTML(data);
        this.attachEventListeners();
      })
      .catch(error => {
        console.error('Error loading widget data:', error);
        this.container.innerHTML = this.getErrorHTML(error);
      });

    // Subscribe to data changes
    this.subscribeToDataChanges();

    return this.container;
  }

  /**
   * Get skeleton HTML for loading state
   * @returns {string}
   */
  getSkeletonHTML() {
    return `
      <div class="skeleton" style="height: 200px; border-radius: 8px;"></div>
    `;
  }

  /**
   * Get error HTML
   * @param {Error} error
   * @returns {string}
   */
  getErrorHTML(error) {
    return `
      <div style="padding: 20px; text-align: center; color: var(--color-danger);">
        <p>Error loading data: ${error.message}</p>
      </div>
    `;
  }

  /**
   * Get content HTML (must be implemented by subclasses)
   * @param {any} data
   * @returns {string}
   */
  getContentHTML(data) {
    throw new Error('getContentHTML must be implemented by subclass');
  }

  /**
   * Load data (must be implemented by subclasses)
   * @returns {Promise<any>}
   */
  async loadData() {
    throw new Error('loadData must be implemented by subclass');
  }

  /**
   * Attach event listeners to widget
   */
  attachEventListeners() {
    // Override in subclasses if needed
  }

  /**
   * Refresh widget data and re-render
   */
  async refresh() {
    if (!this.container) return;

    this.container.innerHTML = this.getSkeletonHTML();

    try {
      const data = await this.loadData();
      this.container.innerHTML = this.getContentHTML(data);
      this.attachEventListeners();
    } catch (error) {
      console.error('Error refreshing widget:', error);
      this.container.innerHTML = this.getErrorHTML(error);
    }
  }

  /**
   * Subscribe to data changed event
   */
  subscribeToDataChanges() {
    this.eventListener = () => {
      this.refresh();
    };
    window.addEventListener('solidfit:data-changed', this.eventListener);
  }

  /**
   * Destroy widget (clean up event listeners)
   */
  destroy() {
    if (this.eventListener) {
      window.removeEventListener('solidfit:data-changed', this.eventListener);
    }
  }
}

