
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Personality } from '../types';

export const usePersonalities = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonalities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('personalities')
          .select('id, name, url_array');

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('No personality data available');
        }

        // Process and validate the data
        const processedData = data.map(personality => ({
          id: personality.id,
          name: personality.name,
          url_array: Array.isArray(personality.url_array) ? personality.url_array : []
        }));

        // Only set personalities if we have at least one valid personality
        if (processedData.length > 0) {
          setPersonalities(processedData);
        } else {
          throw new Error('No valid personality data available');
        }

      } catch (err) {
        console.error('Error fetching personalities:', err);
        setError(err instanceof Error ? err.message : 'Error loading personalities');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalities();
  }, []);

  return { personalities, loading, error };
};

export default usePersonalities;
