
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Personality } from '../types';
import { MAX_STEPS } from '../constants';
import { toast } from '@/hooks/use-toast';

export const usePersonalities = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to validate image URL
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) !== null;
    } catch {
      return false;
    }
  };

  // Helper function to validate personality data
  const validatePersonality = (personality: any): boolean => {
    return (
      personality &&
      Array.isArray(personality.url_array) &&
      personality.url_array.length >= MAX_STEPS &&
      personality.url_array.every((url: string) => isValidImageUrl(url))
    );
  };

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

        // Process and validate personalities
        const validPersonalities = data
          .filter(validatePersonality)
          .map(personality => ({
            id: personality.id,
            name: personality.name,
            url_array: personality.url_array.slice(0, MAX_STEPS) // Ensure we only take the required number of images
          }));

        // We need at least 3 valid personalities
        if (validPersonalities.length < 3) {
          throw new Error('Not enough valid personalities available (need at least 3)');
        }

        setPersonalities(validPersonalities);
      } catch (err) {
        console.error('Error fetching personalities:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error loading personalities';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalities();
  }, []);

  return { personalities, loading, error };
};

export default usePersonalities;
