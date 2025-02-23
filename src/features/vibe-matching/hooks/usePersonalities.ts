
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Personality } from '../types';
import { MAX_STEPS } from '../constants';

export const usePersonalities = () => {
  const { data: personalities = [], isLoading, error } = useQuery({
    queryKey: ['personalities'],
    queryFn: async () => {
      console.log('Fetching personalities data');
      
      const { data, error } = await supabase
        .from('personalities')
        .select('id, name, url_array, url_metadata, core_traits, behavior_patterns')
        .filter('url_array', 'not.is', null)
        .order('name');

      if (error) {
        console.error('Error fetching personalities:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('No personality data available');
        throw new Error('No personality data available');
      }

      const validPersonalities = data.filter(p => {
        const isValid = p.url_array && p.url_array.length >= MAX_STEPS;
        if (!isValid) {
          console.warn(`Personality ${p.name} has insufficient media:`, p.url_array?.length ?? 0);
        }
        return isValid;
      });

      if (validPersonalities.length < 3) {
        console.error('Not enough valid personalities:', validPersonalities.length);
        throw new Error('Not enough valid personalities available (need at least 3)');
      }

      console.log('Successfully fetched personalities:', validPersonalities.length);
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
