
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
        .select('id, name, url_array, url_metadata, core_traits, behavior_patterns')
        .filter('url_array', 'not.is', null)
        .order('name');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No personality data available');
      }

      const validPersonalities = data.filter(p => 
        p.url_array && 
        p.url_array.length >= MAX_STEPS
      );

      if (validPersonalities.length < 3) {
        throw new Error('Not enough valid personalities available (need at least 3)');
      }

      // Now the data already matches our Personality type
      return validPersonalities;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  return {
    personalities,
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? 'Error loading personalities' : null
  };
};

export default usePersonalities;
