// Using dynamic import for js-cookie
let Cookies;
import('js-cookie').then(module => {
  Cookies = module.default;
});

import CryptoJS from 'crypto-js';
const { AES, enc } = CryptoJS;

const COOKIE_ENCRYPTION_KEY = import.meta.env.VITE_COOKIE_ENCRYPTION_KEY || 'default-key-change-in-prod';
const COOKIE_PREFIX = 'sam_gov_';
const DEFAULT_COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: true, // Only transmitted over HTTPS
  sameSite: 'Strict',
  path: '/'
};

/**
 * Encrypts sensitive data before storing in cookie
 */
const encryptData = (data) => {
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  return AES.encrypt(stringData, COOKIE_ENCRYPTION_KEY).toString();
};

/**
 * Decrypts data from cookie
 */
const decryptData = (encryptedData) => {
  try {
    const bytes = AES.decrypt(encryptedData, COOKIE_ENCRYPTION_KEY);
    const decryptedString = bytes.toString(enc.Utf8);
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Cookie decryption failed:', error);
    return null;
  }
};

/**
 * Sets a cookie with encryption for sensitive data
 */
export const setCookie = async (name, value, options = {}) => {
  // Ensure Cookies is loaded
  if (!Cookies) {
    const module = await import('js-cookie');
    Cookies = module.default;
  }

  const fullName = COOKIE_PREFIX + name;
  const encryptedValue = encryptData(value);
  Cookies.set(fullName, encryptedValue, { ...DEFAULT_COOKIE_OPTIONS, ...options });
};

/**
 * Gets and decrypts a cookie value
 */
export const getCookie = async (name) => {
  // Ensure Cookies is loaded
  if (!Cookies) {
    const module = await import('js-cookie');
    Cookies = module.default;
  }

  const fullName = COOKIE_PREFIX + name;
  const encryptedValue = Cookies.get(fullName);
  if (!encryptedValue) return null;
  return decryptData(encryptedValue);
};

/**
 * Removes a cookie
 */
export const removeCookie = async (name) => {
  // Ensure Cookies is loaded
  if (!Cookies) {
    const module = await import('js-cookie');
    Cookies = module.default;
  }

  const fullName = COOKIE_PREFIX + name;
  Cookies.remove(fullName, { path: '/' });
};

/**
 * Gets all cookies with our prefix
 */
export const getAllCookies = async () => {
  // Ensure Cookies is loaded
  if (!Cookies) {
    const module = await import('js-cookie');
    Cookies = module.default;
  }

  const allCookies = Cookies.get();
  const ourCookies = {};
  
  Object.keys(allCookies).forEach(key => {
    if (key.startsWith(COOKIE_PREFIX)) {
      const shortKey = key.replace(COOKIE_PREFIX, '');
      ourCookies[shortKey] = decryptData(allCookies[key]);
    }
  });
  
  return ourCookies;
};

/**
 * Clears all cookies with our prefix
 */
export const clearAllCookies = async () => {
  // Ensure Cookies is loaded
  if (!Cookies) {
    const module = await import('js-cookie');
    Cookies = module.default;
  }

  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach(key => {
    if (key.startsWith(COOKIE_PREFIX)) {
      Cookies.remove(key, { path: '/' });
    }
  });
};

// Cookie keys for our application
export const COOKIE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  LAST_VISIT: 'last_visit',
  SAVED_FILTERS: 'saved_filters',
  RECENT_SEARCHES: 'recent_searches'
};
