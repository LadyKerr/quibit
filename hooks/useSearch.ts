import { useState, useMemo } from 'react';

export interface SearchableItem {
  id: string;
  title: string;
  content?: string;
  notes?: string | null;
  category?: string;
  url?: string;
  created_at: string;
}

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'category';

export interface SearchFilters {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasNotes?: boolean;
}

export function useSearch<T extends SearchableItem>(
  items: T[],
  searchFields: (keyof T)[] = ['title', 'content', 'notes']
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Search function that looks through specified fields
  const searchItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [items, searchQuery, searchFields]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let result = searchItems;

    // Category filter
    if (filters.category && filters.category !== 'All') {
      result = result.filter(item => item.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange) {
      result = result.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
      });
    }

    // Has notes filter (for links)
    if (filters.hasNotes !== undefined) {
      result = result.filter(item => {
        const hasNotes = item.notes && item.notes.trim().length > 0;
        return filters.hasNotes ? hasNotes : !hasNotes;
      });
    }

    return result;
  }, [searchItems, filters]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'category':
        return sorted.sort((a, b) => {
          const categoryA = a.category || '';
          const categoryB = b.category || '';
          return categoryA.localeCompare(categoryB);
        });
      default:
        return sorted;
    }
  }, [filteredItems, sortBy]);

  // Get unique categories from items
  const availableCategories = useMemo(() => {
    const categories = items
      .map(item => item.category)
      .filter((category): category is string => Boolean(category));
    return ['All', ...Array.from(new Set(categories)).sort()];
  }, [items]);

  // Clear all filters and search
  const clearAll = () => {
    setSearchQuery('');
    setSortBy('newest');
    setFilters({});
  };

  // Update individual filter
  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      (filters.category && filters.category !== 'All') ||
      filters.dateRange !== undefined ||
      filters.hasNotes !== undefined
    );
  }, [searchQuery, filters]);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    
    // Sort state
    sortBy,
    setSortBy,
    
    // Filter state
    filters,
    setFilters,
    updateFilter,
    
    // Results
    items: sortedItems,
    totalCount: items.length,
    filteredCount: sortedItems.length,
    
    // Helpers
    availableCategories,
    hasActiveFilters,
    clearAll,
  };
}

// Helper function to get sort display name
export const getSortDisplayName = (sortOption: SortOption): string => {
  switch (sortOption) {
    case 'newest':
      return 'Newest First';
    case 'oldest':
      return 'Oldest First';
    case 'title-asc':
      return 'Title A-Z';
    case 'title-desc':
      return 'Title Z-A';
    case 'category':
      return 'Category';
    default:
      return 'Newest First';
  }
};
