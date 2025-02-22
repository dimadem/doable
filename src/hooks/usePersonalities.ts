
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Personality } from '../types/vibe';

export const usePersonalities = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonalities = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('personalities')
        .select('id, name, url_array');

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError('No personality data available');
        setLoading(false);
        return;
      }

      try {
        const processedData = data.map(personality => {
          try {
            let parsedArray: string[] = [];
            if (typeof personality.url_array === 'string') {
              parsedArray = JSON.parse(personality.url_array);
            } else if (Array.isArray(personality.url_array)) {
              parsedArray = personality.url_array;
            }
            return {
              ...personality,
              url_array: parsedArray
            };
          } catch (parseError) {
            return {
              ...personality,
              url_array: []
            };
          }
        });

        setPersonalities(processedData);
      } catch (processError) {
        setError('Error processing personality data');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalities();
  }, []);

  return { personalities, loading, error };
};
