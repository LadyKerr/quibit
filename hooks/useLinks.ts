import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export type SortOrder = 'newest' | 'oldest';

export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  timestamp: number;
  createdAt: string;
}

const STORAGE_KEY = '@quirbit_links';
const CATEGORIES_KEY = '@quirbit_categories';
const DEFAULT_CATEGORIES = ['Blog', 'Tutorial', 'Video', 'Article', 'Other'];

// Utility function to format relative time
const getRelativeTime = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return then.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedLinks, storedCategories] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY),
      ]);

      if (storedLinks) {
        const parsedLinks = JSON.parse(storedLinks);
        const updatedLinks = parsedLinks.map((link: Link) => ({
          ...link,
          createdAt: link.createdAt || new Date(link.timestamp).toISOString(),
        }));
        setLinks(updatedLinks);
        
        if (updatedLinks.some((link: Link) => !link.createdAt)) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
        }
      }

      if (storedCategories) {
        setCustomCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: string) => {
    try {
      const normalizedCategory = category.trim();
      if (!normalizedCategory) return false;
      
      // Don't add if it already exists in either default or custom categories
      if ([...DEFAULT_CATEGORIES, ...customCategories].includes(normalizedCategory)) {
        return false;
      }

      const updatedCategories = [...customCategories, normalizedCategory].sort();
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      setCustomCategories(updatedCategories);
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  };

  const addLink = async (title: string, url: string, category: string) => {
    try {
      const now = new Date();
      const newLink: Link = {
        id: now.getTime().toString(),
        title,
        url,
        category,
        timestamp: now.getTime(),
        createdAt: now.toISOString(),
      };
      const updatedLinks = [...links, newLink];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
      setLinks(updatedLinks);

      // If this is a new category, add it to custom categories
      if (category && 
          !DEFAULT_CATEGORIES.includes(category) && 
          !customCategories.includes(category)) {
        await addCategory(category);
      }

      return true;
    } catch (error) {
      console.error('Error adding link:', error);
      return false;
    }
  };

  const editLink = async (id: string, updates: Partial<Omit<Link, 'id' | 'timestamp' | 'createdAt'>>) => {
    try {
      const updatedLinks = links.map(link => 
        link.id === id
          ? { ...link, ...updates }
          : link
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
      setLinks(updatedLinks);

      // If the category was updated and it's new, add it to custom categories
      if (updates.category && 
          !DEFAULT_CATEGORIES.includes(updates.category) && 
          !customCategories.includes(updates.category)) {
        await addCategory(updates.category);
      }

      return true;
    } catch (error) {
      console.error('Error editing link:', error);
      return false;
    }
  };

  // Get unique categories from links and combine with default and custom categories
  const categories = [...new Set([
    ...DEFAULT_CATEGORIES,
    ...customCategories,
    ...links.map(link => link.category)
  ])].filter(Boolean).sort();

  const filteredLinks = links.filter(link => {
    const matchesSearch = 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || link.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });

  return {
    links: filteredLinks,
    loading,
    addLink,
    editLink,
    addCategory,
    searchQuery,
    setSearchQuery,
    categories,
    customCategories,
    selectedCategory,
    setSelectedCategory,
    getRelativeTime,
    sortOrder,
    setSortOrder,
  };
};