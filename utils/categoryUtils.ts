import { CATEGORY_COLORS } from '../components/CategoryButtons';

/**
 * Helper function to add transparency to hex colors
 * @param hexColor - Hex color string (with or without #)
 * @param opacity - Opacity value between 0 and 1 (default: 0.2)
 * @returns RGBA color string
 */
export const addTransparency = (hexColor: string, opacity: number = 0.2): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get category colors with fallback logic
 * @param category - The category name
 * @param categoryColors - Custom category colors mapping
 * @returns Object with background and text colors
 */
export const getCategoryColors = (
  category: string,
  categoryColors: { [key: string]: string } = {}
): { background: string; text: string } => {
  const trimmedCategory = category.trim().replace(/[<>]/g, '');
  const customColor = categoryColors[trimmedCategory];
  
  if (customColor) {
    return {
      background: addTransparency(customColor),
      text: customColor
    };
  }
  
  return CATEGORY_COLORS[trimmedCategory] || CATEGORY_COLORS.Other || { background: '#F0F0F0', text: '#666666' };
};
