import { CATEGORY_COLORS } from '../components/CategoryButtons';

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
  const customColor = categoryColors[category];
  
  if (customColor) {
    return {
      background: `${customColor}30`, // Add transparency
      text: customColor
    };
  }
  
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
};
