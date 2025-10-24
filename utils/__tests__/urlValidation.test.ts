/**
 * @jest-environment node
 */
import { validateUrl, processUrl } from '../urlValidation';

describe('URL Validation Utilities', () => {
  describe('validateUrl', () => {
    it('should validate a correct URL', () => {
      const result = validateUrl('https://google.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate URL without protocol', () => {
      const result = validateUrl('google.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty URL', () => {
      const result = validateUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('should reject whitespace-only URL', () => {
      const result = validateUrl('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('should reject URLs that are too long', () => {
      const longUrl = 'https://exampletest.com/' + 'a'.repeat(3000);
      const result = validateUrl(longUrl);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL is too long');
    });

    it('should reject blocked domains', () => {
      const result = validateUrl('https://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This domain is not allowed');
    });

    it('should reject invalid protocols', () => {
      const result = validateUrl('ftp://google.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only HTTP and HTTPS protocols are allowed');
    });

    it('should validate complex URLs with paths', () => {
      const result = validateUrl('https://github.com/user/repo/issues/123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate URLs with subdomains', () => {
      const result = validateUrl('https://api.github.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject malformed URLs', () => {
      const result = validateUrl('not a url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid URL');
    });
  });

  describe('processUrl', () => {
    it('should add https:// to URL without protocol', () => {
      const result = processUrl('google.com');
      expect(result).toBe('https://google.com');
    });

    it('should not modify URL with http://', () => {
      const result = processUrl('http://google.com');
      expect(result).toBe('http://google.com');
    });

    it('should not modify URL with https://', () => {
      const result = processUrl('https://google.com');
      expect(result).toBe('https://google.com');
    });

    it('should trim whitespace', () => {
      const result = processUrl('  google.com  ');
      expect(result).toBe('https://google.com');
    });

    it('should handle mixed case protocols', () => {
      const result = processUrl('HTTP://google.com');
      expect(result).toBe('HTTP://google.com');
    });
  });
});
