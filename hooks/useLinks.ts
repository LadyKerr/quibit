import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [categoryColors, setCategoryColors] = useState<{ [key: string]: string }>({});
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

      // Load category colors from Supabase
      if (session?.user?.id) {
        try {
          const { data: colorsData, error: colorsError } = await supabase
            .from('category_colors')
            .select('category_name, color')
            .eq('user_id', session.user.id);

          if (colorsError) throw colorsError;

          const colorsMap: { [key: string]: string } = {};
          colorsData?.forEach(item => {
            colorsMap[item.category_name] = item.color;
          });
          
          setCategoryColors(colorsMap);

          // Migrate existing AsyncStorage data to Supabase if needed
          await migrateColorsFromAsyncStorage();
        } catch (error) {
          console.error('Error loading category colors:', error);
        }
      }
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
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('links')
        .insert([
          {
            title,
            url,
            category,
            notes,
            user_id: session.user.id,
            created_at: now // Explicitly set the timestamp
          }
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

      // Delete associated category color
      await supabase
        .from('category_colors')
        .delete()
        .eq('category_name', name)
        .eq('user_id', session.user.id);

      // Update categories state
      setCategories(prev => prev.filter(cat => cat !== name));
      
      // Update category colors state
      setCategoryColors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
      
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
      // Check if new name already exists in default categories
      const { data: defaultCheck } = await supabase
        .from('default_categories')
        .select('name')
        .eq('name', newName)
        .single();

      if (defaultCheck) {
        return { success: false, error: 'Category name conflicts with a default category' };
      }

      // Check if new name already exists in user categories
      const { data: existingCheck } = await supabase
        .from('categories')
        .select('name')
        .eq('name', newName)
        .eq('user_id', session.user.id)
        .single();

      if (existingCheck) {
        return { success: false, error: 'Category name already exists' };
      }

      // Check if the old name is a default category
      const { data: isDefaultCategory } = await supabase
        .from('default_categories')
        .select('name')
        .eq('name', oldName)
        .single();

      if (isDefaultCategory) {
        // For default categories, create a new user category with the new name
        const { error: insertError } = await supabase
          .from('categories')
          .insert([
            {
              name: newName,
              user_id: session.user.id,
            },
          ]);

        if (insertError) throw insertError;
      } else {
        // For user categories, update the existing record
        const { error: updateError } = await supabase
          .from('categories')
          .update({ name: newName })
          .eq('name', oldName)
          .eq('user_id', session.user.id);

        if (updateError) throw updateError;
      }

      // Update categories state
      setCategories(prev => prev.map(cat => cat === oldName ? newName : cat).sort());

      // Update all links with this category
      await supabase
        .from('links')
        .update({ category: newName })
        .eq('category', oldName)
        .eq('user_id', session.user.id);

      // Update category color if it exists
      await supabase
        .from('category_colors')
        .update({ category_name: newName })
        .eq('category_name', oldName)
        .eq('user_id', session.user.id);

      // Update category colors state
      setCategoryColors(prev => {
        if (prev[oldName]) {
          const updated = { ...prev };
          updated[newName] = updated[oldName];
          delete updated[oldName];
          return updated;
        }
        return prev;
      });

      return { success: true };
    } catch (error) {
      console.error('Error editing category:', error);
      return { success: false, error: 'Failed to edit category' };
    }
  };

  const migrateColorsFromAsyncStorage = async () => {
    if (!session?.user?.id) return;

    try {
      const colorsKey = `category_colors_${session.user.id}`;
      const savedColors = await AsyncStorage.getItem(colorsKey);
      
      if (savedColors) {
        const colors = JSON.parse(savedColors);
        
        // Check if we already have colors in Supabase
        const { data: existingColors } = await supabase
          .from('category_colors')
          .select('category_name')
          .eq('user_id', session.user.id)
          .limit(1);

        // Only migrate if no colors exist in Supabase
        if (!existingColors || existingColors.length === 0) {
          const colorEntries = Object.entries(colors).map(([categoryName, color]) => ({
            user_id: session.user.id,
            category_name: categoryName,
            color: color as string,
          }));

          if (colorEntries.length > 0) {
            const { error } = await supabase
              .from('category_colors')
              .insert(colorEntries);

            if (!error) {
              // Remove from AsyncStorage after successful migration
              await AsyncStorage.removeItem(colorsKey);
              console.log('Successfully migrated category colors to Supabase');
            } else {
              console.error('Error migrating colors to Supabase:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during color migration:', error);
    }
  };

  const updateCategoryColor = async (categoryName: string, color: string) => {
    if (!session?.user) return { success: false, error: 'Not authenticated' };

    try {
      // Use upsert to insert or update the color
      const { error } = await supabase
        .from('category_colors')
        .upsert({
          user_id: session.user.id,
          category_name: categoryName,
          color: color,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,category_name'
        });

      if (error) throw error;
      
      // Update local state
      setCategoryColors(prev => ({ ...prev, [categoryName]: color }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating category color:', error);
      return { success: false, error: 'Failed to update category color' };
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
    updateCategoryColor,
    categories,
    categoryColors,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
  };
};