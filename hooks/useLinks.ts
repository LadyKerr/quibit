import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type SortOrder = 'newest' | 'oldest';

export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  notes?: string; // Add optional notes field
  created_at: string;
  user_id: string;
}

const DEFAULT_CATEGORIES = ['Blog', 'Tutorial', 'Video', 'Article', 'Other'];

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      loadLinks();
      loadCategories();
    }
  }, [session?.user?.id]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Load default categories
      const { data: defaultData, error: defaultError } = await supabase
        .from('default_categories')
        .select('name');

      if (defaultError) throw defaultError;

      // Load user categories
      const { data: userData, error: userError } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', session?.user?.id);

      if (userError) throw userError;

      // Combine and sort categories
      const defaultCategories = defaultData?.map(cat => cat.name) || [];
      const userCategories = userData?.map(cat => cat.name) || [];
      
      setCategories([...new Set([...defaultCategories, ...userCategories])].sort());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addLink = async (
    title: string,
    url: string,
    category: string,
    notes?: string | null
  ) => {
    if (!session?.user) return false;

    try {
      const { data, error } = await supabase
        .from('links')
        .insert([
          {
            title,
            url,
            category,
            notes,
            user_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setLinks((prev) => [data, ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding link:', error);
      return false;
    }
  };

  const addCategory = async (name: string) => {
    if (!session?.user) return false;

    try {
      // Check if category exists in default categories
      const { data: defaultCheck } = await supabase
        .from('default_categories')
        .select('name')
        .eq('name', name)
        .single();

      if (defaultCheck) {
        return false;
      }

      // Check if category exists in user categories
      const { data: userCheck } = await supabase
        .from('categories')
        .select('name')
        .eq('name', name)
        .eq('user_id', session.user.id)
        .single();

      if (userCheck) {
        return false;
      }

      // Insert new category
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      setCategories(prev => [...prev, name].sort());
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  };

  const editLink = async (
    id: string,
    updates: Partial<Omit<Link, 'id' | 'created_at' | 'user_id'>>
  ) => {
    if (!session?.user) return false;

    try {
      const { error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, ...updates } : link))
      );
      return true;
    } catch (error) {
      console.error('Error editing link:', error);
      return false;
    }
  };

  const deleteLink = async (id: string) => {
    if (!session?.user) return false;

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setLinks((prev) => prev.filter((link) => link.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting link:', error);
      return false;
    }
  };

  const filteredLinks = links
    .filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || link.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return {
    links: filteredLinks,
    loading,
    addLink,
    editLink,
    deleteLink,
    addCategory,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
  };
};