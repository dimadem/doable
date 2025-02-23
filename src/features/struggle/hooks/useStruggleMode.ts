
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchLatestSession, updateSessionStruggleType, type StruggleType } from '../services/sessionService';
import { sessionLogger } from '@/utils/sessionLogger';
import { getSessionData } from '@/features/session/utils/sessionStorage';
import { PersonalityAnalysis, SessionResponse } from '../types';
import { formatTraits, getPersonalityType, isStoredPersonalityData } from '../utils/personalityUtils';

export const useStruggleMode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionData = getSessionData();

  const { data: sessionResponse } = useQuery<SessionResponse>({
    queryKey: ['latestSession'],
    queryFn: fetchLatestSession,
    enabled: !sessionData?.personalityData,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          sessionLogger.error('Failed to load session data', error);
          toast({
            title: "Error",
            description: "Failed to load session data",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    }
  });

  const handleStruggleTypeSelect = async (struggleType: StruggleType) => {
    if (!sessionData?.sessionId) {
      sessionLogger.error('No active session found');
      toast({
        title: "Error",
        description: "No active session found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const personalityData = sessionData.personalityData || sessionResponse?.personalities;

    if (!personalityData) {
      sessionLogger.error('No personality type found');
      toast({
        title: "Error",
        description: "No personality type found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      const personalityType = getPersonalityType(personalityData);
      
      const personality: PersonalityAnalysis = {
        type: personalityType,
        traits: formatTraits(
          isStoredPersonalityData(personalityData) && personalityData.core_traits
            ? personalityData.core_traits
            : 'core_traits' in personalityData
              ? personalityData.core_traits
              : null
        ),
        patterns: {},
        selections: isStoredPersonalityData(personalityData)
          ? personalityData.selections
          : sessionResponse?.session_data?.selections || []
      };

      // Store struggle type in session
      localStorage.setItem('voice_session_context', JSON.stringify({
        struggleType,
        lastUpdate: new Date().toISOString()
      }));

      await updateSessionStruggleType(
        sessionData.sessionId,
        struggleType,
        personalityType,
        personality
      );
      
      sessionLogger.info('Struggle type updated successfully', {
        struggleType,
        sessionId: sessionData.sessionId
      });

      toast({
        title: "Success",
        description: `${struggleType.replace('_', ' ')} mode activated`,
      });
      
      navigate('/voice-double');
    } catch (error) {
      sessionLogger.error('Failed to update struggle type', error);
      toast({
        title: "Error",
        description: "Failed to update struggle type",
        variant: "destructive",
      });
    }
  };

  return {
    sessionData,
    sessionResponse,
    handleStruggleTypeSelect
  };
};
