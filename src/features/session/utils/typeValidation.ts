
import { CoreTraits, BehaviorPatterns } from '@/features/vibe-matching/types';

export function isValidCoreTraits(traits: any): traits is CoreTraits {
  if (!traits || typeof traits !== 'object') return false;
  
  const validTraits = ['adaptability', 'empathy', 'resilience', 'creativity', 'analytical'];
  return Object.entries(traits).every(([key, value]) => 
    validTraits.includes(key) && (typeof value === 'number' || value === undefined)
  );
}

export function isValidBehaviorPatterns(patterns: any): patterns is BehaviorPatterns {
  if (!patterns || typeof patterns !== 'object') return false;

  const validPatterns = [
    'communication_style',
    'problem_solving',
    'stress_response',
    'learning_preference',
    'work_style'
  ];

  const validValues = {
    communication_style: ['direct', 'indirect', 'analytical', 'intuitive'],
    problem_solving: ['systematic', 'creative', 'collaborative', 'independent'],
    stress_response: ['adaptive', 'reactive', 'proactive', 'avoidant'],
    learning_preference: ['visual', 'auditory', 'kinesthetic', 'reading/writing'],
    work_style: ['structured', 'flexible', 'deadline-driven', 'self-paced']
  };

  return Object.entries(patterns).every(([key, value]) => 
    validPatterns.includes(key) && 
    validValues[key as keyof typeof validValues]?.includes(value as string)
  );
}
