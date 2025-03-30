import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Try to fetch a single row from the links table
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .limit(1);

      if (error) {
        setError(error.message);
        setIsConnected(false);
        return;
      }

      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsConnected(false);
    }
  };

  return { isConnected, error, testConnection };
}