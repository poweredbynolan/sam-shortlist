import DOMPurify from 'dompurify';

// Sanitize HTML content to prevent XSS attacks
export function sanitizeHtml(content) {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// Encode special characters to prevent XSS
export function encodeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escape[match];
  });
}

// Validate and sanitize search input
export function sanitizeSearchQuery(query) {
  // Remove any potentially dangerous characters
  return query.replace(/[<>{}()]/g, '').trim();
}

// Rate limiting for API calls
export class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  checkLimit(clientId) {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];
    
    // Remove old requests outside the time window
    const recentRequests = clientRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    return true;
  }
}

// CSRF token management
export const csrfToken = {
  get() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  },
  
  // Include CSRF token in headers for API requests
  getHeaders() {
    return {
      'X-CSRF-Token': this.get(),
      'Content-Type': 'application/json'
    };
  }
};

// Input validation for contract opportunities
export const validateOpportunity = {
  title(title) {
    return typeof title === 'string' && 
           title.length >= 3 && 
           title.length <= 200 &&
           /^[a-zA-Z0-9\s\-_.,()&]+$/.test(title);
  },
  
  description(desc) {
    return typeof desc === 'string' && 
           desc.length >= 10 && 
           desc.length <= 5000;
  },
  
  amount(value) {
    return typeof value === 'number' && 
           value >= 0 && 
           value <= 1000000000;
  },
  
  date(dateStr) {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  }
};

// Secure storage wrapper
export const secureStorage = {
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
    } catch (e) {
      console.error('Error saving to secure storage:', e);
    }
  },
  
  get(key) {
    try {
      const serialized = sessionStorage.getItem(key);
      return serialized ? JSON.parse(serialized) : null;
    } catch (e) {
      console.error('Error reading from secure storage:', e);
      return null;
    }
  },
  
  remove(key) {
    sessionStorage.removeItem(key);
  },
  
  clear() {
    sessionStorage.clear();
  }
};
