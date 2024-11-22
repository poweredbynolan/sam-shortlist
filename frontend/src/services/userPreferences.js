import { setCookie, getCookie, COOKIE_KEYS } from '../utils/cookieManager';

const DEFAULT_PREFERENCES = {
  theme: 'light',
  resultsPerPage: 10,
  dateRange: '1month',
  savedFilters: [],
  notificationEnabled: true,
  autoRefresh: false
};

/**
 * Manages user preferences with cookie persistence
 */
class UserPreferences {
  constructor() {
    this.preferences = DEFAULT_PREFERENCES;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  /**
   * Initialize preferences from cookie
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      const savedPrefs = await getCookie(COOKIE_KEYS.USER_PREFERENCES);
      this.preferences = { ...DEFAULT_PREFERENCES, ...savedPrefs };
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      this.preferences = { ...DEFAULT_PREFERENCES };
    }
  }

  /**
   * Ensure preferences are initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  /**
   * Loads preferences from cookie or returns defaults
   */
  async loadPreferences() {
    await this.ensureInitialized();
    return this.preferences;
  }

  /**
   * Saves preferences to cookie
   */
  async savePreferences() {
    await this.ensureInitialized();
    await setCookie(COOKIE_KEYS.USER_PREFERENCES, this.preferences);
  }

  /**
   * Gets a specific preference value
   */
  async get(key) {
    await this.ensureInitialized();
    return this.preferences[key];
  }

  /**
   * Sets a specific preference value
   */
  async set(key, value) {
    await this.ensureInitialized();
    this.preferences[key] = value;
    await this.savePreferences();
  }

  /**
   * Updates multiple preferences at once
   */
  async update(newPreferences) {
    await this.ensureInitialized();
    this.preferences = {
      ...this.preferences,
      ...newPreferences
    };
    await this.savePreferences();
  }

  /**
   * Resets preferences to defaults
   */
  async reset() {
    await this.ensureInitialized();
    this.preferences = { ...DEFAULT_PREFERENCES };
    await this.savePreferences();
  }

  /**
   * Gets all current preferences
   */
  async getAll() {
    await this.ensureInitialized();
    return { ...this.preferences };
  }

  /**
   * Adds a saved filter
   */
  async addSavedFilter(filter) {
    await this.ensureInitialized();
    const filters = this.preferences.savedFilters || [];
    if (!filters.some(f => f.name === filter.name)) {
      filters.push(filter);
      await this.set('savedFilters', filters);
    }
  }

  /**
   * Removes a saved filter
   */
  async removeSavedFilter(filterName) {
    await this.ensureInitialized();
    const filters = this.preferences.savedFilters || [];
    await this.set('savedFilters', filters.filter(f => f.name !== filterName));
  }
}

// Export a singleton instance
export const userPreferences = new UserPreferences();
