
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Personality } from '../types';
import { MAX_STEPS } from '../constants';
import { validateMediaUrl, preloadMedia } from '../utils/imageUtils';

export const usePersonalities = () => {
  const { data: personalities = [], isLoading, error } = useQuery({
    queryKey: ['personalities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personalities')
        .select('id, name, url_array, url_metadata')
        .filter('url_array', 'not.is', null)
        .order('name');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No personality data available');
      }

      // Process and validate personalities
      const validPersonalities = await Promise.all(
        data.map(async (personality) => {
          const validUrls = (personality.url_array || [])
            .filter(validateMediaUrl)
            .slice(0, MAX_STEPS);

          // Preload media and gather metadata
          const mediaMetadata = await Promise.all(
            validUrls.map(url => preloadMedia(url))
          );

          return {
            ...personality,
            url_array: validUrls,
            url_metadata: mediaMetadata
          };
        })
      );

      // We need at least 3 valid personalities
      if (validPersonalities.filter(p => p.url_array.length >= MAX_STEPS).length < 3) {
        throw new Error('Not enough valid personalities available (need at least 3)');
      }

      return validPersonalities;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  return {
    personalities: personalities || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? 'Error loading personalities' : null
  };
};

export default usePersonalities;
