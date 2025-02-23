
import { CoreTraits, BehaviorPatterns } from '@/features/vibe-matching/types';
import { StoredPersonalityData } from '@/features/session/types/session.types';

export interface PersonalityInfo {
  name: string;
  core_traits: CoreTraits;
  behavior_patterns: BehaviorPatterns;
}

export const formatTraits = (traits: Record<string, any> | null) => {
  if (!traits) return {};
  return Object.entries(traits).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, number>);
};

export const isStoredPersonalityData = (data: any): data is StoredPersonalityData => {
  return data && typeof data === 'object' && 'personalityKey' in data && 'selections' in data;
};

export const isPersonalityInfo = (data: any): data is PersonalityInfo => {
  return data && typeof data === 'object' && 'name' in data && 'core_traits' in data;
};

export const getPersonalityType = (data: StoredPersonalityData | PersonalityInfo | string): string => {
  if (isStoredPersonalityData(data)) {
    return data.finalPersonality;
  } else if (isPersonalityInfo(data)) {
    return data.name;
  } else if (typeof data === 'string') {
    return data;
  }
  return '';
};
