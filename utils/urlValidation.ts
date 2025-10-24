/**
 * URL validation utilities for link management
 */

// Simplified regex to avoid ReDoS vulnerability
const URL_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
const MAX_URL_LENGTH = 2048;
const BLOCKED_DOMAINS = ['example.com', 'evil.com'];

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a URL string
 * @param url - The URL to validate
 * @returns Validation result with isValid flag and optional error message
 */
export const validateUrl = (url: string): UrlValidationResult => {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  if (url.length > MAX_URL_LENGTH) {
    return { isValid: false, error: 'URL is too long' };
  }

  let processedUrl = url.trim().toLowerCase();
  if (!processedUrl.startsWith('http')) {
    processedUrl = `https://${processedUrl}`;
  }

  try {
    const urlObj = new URL(processedUrl);
    
    // Check for blocked domains
    const domain = urlObj.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.includes(domain)) {
      return { isValid: false, error: 'This domain is not allowed' };
    }

    // Check for valid protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Check URL format with regex
    if (!URL_REGEX.test(processedUrl)) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL' };
  }
};

/**
 * Processes a URL by adding https:// if no protocol is present
 * @param url - The URL to process
 * @returns Processed URL with protocol
 */
export const processUrl = (url: string): string => {
  let processedUrl = url.trim();
  if (!processedUrl.toLowerCase().startsWith('http')) {
    processedUrl = `https://${processedUrl}`;
  }
  return processedUrl;
};
