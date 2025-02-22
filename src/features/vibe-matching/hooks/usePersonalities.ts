
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Personality } from '../types';
import { MAX_STEPS } from '../constants';

export const usePersonalities = () => {
  const { data: personalities = [], isLoading, error } = useQuery({
    queryKey: ['personalities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personalities')
        .select('name, url_array')
        .filter('url_array', 'not.is', null)
        .order('name');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No personality data available');
      }

      // Filter personalities with valid URLs and enough images
      const validPersonalities = data.filter(p => 
        p.url_array && 
        p.url_array.length >= MAX_STEPS
      );

      if (validPersonalities.length < 3) {
        throw new Error('Not enough valid personalities available (need at least 3)');
      }

      return validPersonalities;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  return {
    personalities,
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? 'Error loading personalities' : null
  };
};

export default usePersonalities;
