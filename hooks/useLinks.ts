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
    const loadData = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          await Promise.all([loadLinks(), loadCategories()]);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLinks([]);
        setCategories(DEFAULT_CATEGORIES);
        setLoading(false); // Make sure to set loading to false when there's no session
      }
    };

    loadData();
  }, [session?.user?.id]);

  const loadLinks = async () => {
    try {
      console.log('Loading links for user:', session?.user?.id);

      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Loaded links:', data?.length || 0);
      setLinks(data || []);
      return data;
    } catch (error) {
      console.error('Error loading links:', error);
      setLinks([]);
      throw error;
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
      // First try to insert a submission attempt
      const { error: attemptError } = await supabase
        .from('submission_attempts')
        .insert([{ user_id: session.user.id }]);

      if (attemptError) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // If attempt logged successfully, try to insert the link
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

      if (error) {
        if (error.message.includes('rate_limited_insert_policy')) {
          throw new Error('You have exceeded the link submission limit. Please try again later.');
        }
        throw error;
      }

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

  const deleteCategory = async (name: string) => {
    if (!session?.user) return false;

    try {
      // Check if it's a default category
      const { data: defaultCheck } = await supabase
        .from('default_categories')
        .select('name')
        .eq('name', name)
        .single();

      if (defaultCheck) {
        return { success: false, error: 'Cannot delete default categories' };
      }

      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', name)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update categories state
      setCategories(prev => prev.filter(cat => cat !== name));
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: 'Failed to delete category' };
    }
  };

  const editCategory = async (oldName: string, newName: string) => {
    if (!session?.user) return { success: false, error: 'Not authenticated' };
    if (oldName === newName) return { success: true };

    try {
      // Check if it's a default category
      const { data: defaultCheck } = await supabase
        .from('default_categories')
        .select('name')
        .eq('name', oldName)
        .single();

      if (defaultCheck) {
        return { success: false, error: 'Cannot edit default categories' };
      }

      // Check if new name already exists
      const { data: existingCheck } = await supabase
        .from('categories')
        .select('name')
        .eq('name', newName)
        .single();

      if (existingCheck) {
        return { success: false, error: 'Category name already exists' };
      }

      // Update the category
      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('name', oldName)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update categories state
      setCategories(prev => prev.map(cat => cat === oldName ? newName : cat).sort());

      // Update all links with this category
      await supabase
        .from('links')
        .update({ category: newName })
        .eq('category', oldName)
        .eq('user_id', session.user.id);

      return { success: true };
    } catch (error) {
      console.error('Error editing category:', error);
      return { success: false, error: 'Failed to edit category' };
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
      if (!searchQuery.trim()) {
        // If no search query, only filter by category
        return !selectedCategory || link.category === selectedCategory;
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = [
        link.title || '',
        link.url || '',
        link.notes || ''
      ].some(field => field.toLowerCase().includes(query));

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
    deleteCategory,
    editCategory,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
  };
};