/**
 * @jest-environment node
 */
import { getCategoryColors, addTransparency } from '../categoryUtils';

// Mock the CATEGORY_COLORS from CategoryButtons
jest.mock('../../components/CategoryButtons', () => ({
  CATEGORY_COLORS: {
    Video: { background: '#FFE2E2', text: '#D35D6E' },
    Blog: { background: '#E2F0CB', text: '#7BA05B' },
    Tutorial: { background: '#FFE5B4', text: '#CC8B3C' },
    Article: { background: '#CBE2F0', text: '#3B7B9A' },
    Other: { background: '#E2D5F0', text: '#8860B9' },
    All: { background: '#F0F0F0', text: '#666666' },
  },
}));

describe('Category Utilities', () => {
  describe('addTransparency', () => {
    it('should add transparency to hex color with #', () => {
      const result = addTransparency('#FF0000', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should add transparency to hex color without #', () => {
      const result = addTransparency('00FF00', 0.3);
      expect(result).toBe('rgba(0, 255, 0, 0.3)');
    });

    it('should use default opacity of 0.2', () => {
      const result = addTransparency('#0000FF');
      expect(result).toBe('rgba(0, 0, 255, 0.2)');
    });

    it('should handle lowercase hex colors', () => {
      const result = addTransparency('#abcdef', 0.1);
      expect(result).toBe('rgba(171, 205, 239, 0.1)');
    });

    it('should handle uppercase hex colors', () => {
      const result = addTransparency('#ABCDEF', 0.1);
      expect(result).toBe('rgba(171, 205, 239, 0.1)');
    });
  });

  describe('getCategoryColors', () => {
    it('should return default colors for known category', () => {
      const result = getCategoryColors('Video');
      expect(result).toEqual({ background: '#FFE2E2', text: '#D35D6E' });
    });

    it('should return custom colors when provided', () => {
      const customColors = { 'MyCategory': '#FF5733' };
      const result = getCategoryColors('MyCategory', customColors);
      expect(result.text).toBe('#FF5733');
      expect(result.background).toBe('rgba(255, 87, 51, 0.2)');
    });

    it('should trim category name', () => {
      const result = getCategoryColors('  Blog  ');
      expect(result).toEqual({ background: '#E2F0CB', text: '#7BA05B' });
    });

    it('should sanitize category name by removing <>  characters', () => {
      const result = getCategoryColors('<Blog>');
      expect(result).toEqual({ background: '#E2F0CB', text: '#7BA05B' });
    });

    it('should fall back to Other for unknown category', () => {
      const result = getCategoryColors('UnknownCategory');
      expect(result).toEqual({ background: '#E2D5F0', text: '#8860B9' });
    });

    it('should prefer custom colors over default colors', () => {
      const customColors = { 'Video': '#123456' };
      const result = getCategoryColors('Video', customColors);
      expect(result.text).toBe('#123456');
      expect(result.background).toBe('rgba(18, 52, 86, 0.2)');
    });

    it('should handle trimmed custom category with custom color', () => {
      const customColors = { 'CustomCat': '#AABBCC' };
      const result = getCategoryColors('  CustomCat  ', customColors);
      expect(result.text).toBe('#AABBCC');
    });

    it('should return fallback colors when category is empty', () => {
      const result = getCategoryColors('');
      expect(result).toEqual({ background: '#F0F0F0', text: '#666666' });
    });
  });
});
