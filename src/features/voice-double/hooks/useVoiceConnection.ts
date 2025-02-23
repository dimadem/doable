
import { useCallback, useState } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';
const SESSION_CONTEXT_KEY = 'voice_session_context';

interface SessionContext {
  taskDescription?: string;
  lastUpdate: string;
}

export const useVoiceConnection = () => {
  const { personalityData, sessionId, struggleType } = useSession();
  const [currentTask, setCurrentTask] = useState<string>();
  
  // Load saved context if exists
  const loadSavedContext = (): SessionContext | null => {
    const saved = localStorage.getItem(SESSION_CONTEXT_KEY);
    return saved ? JSON.parse(saved) : null;
  };

  // Save context to localStorage
  const saveContext = (taskDescription: string) => {
    const context: SessionContext = {
      taskDescription,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem(SESSION_CONTEXT_KEY, JSON.stringify(context));
    setCurrentTask(taskDescription);
  };

  // Create conversation instance with basic handlers and tools
  const conversation = useConversation({
    clientTools: {
      set_session_context: async ({ end_conversation, task_description }) => {
        sessionLogger.info('Setting session context', { task_description });
        saveContext(task_description);
        
        if (end_conversation) {
          await conversation.endSession();
        }
        return "Context stored successfully";
      }
    },
    onConnect: () => {
      sessionLogger.info('Voice connection established');
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const connect = useCallback(async () => {
    try {
      if (!sessionId) {
        throw new Error('No active session');
      }

      if (!struggleType) {
        throw new Error('No struggle type selected');
      }

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Load saved context if exists
      const savedContext = loadSavedContext();

      // Start session with dynamic variables
      const conversationId = await conversation.startSession({
        agentId: PUBLIC_AGENT_ID,
        dynamicVariables: {
          personality: personalityData?.finalPersonality || 'default',
          struggle_type: struggleType,
          task_description: savedContext?.taskDescription || undefined
        }
      });

      sessionLogger.info('Voice session started', { 
        conversationId,
        struggleType,
        hasTaskDescription: !!savedContext?.taskDescription
      });

      return conversationId;
    } catch (error) {
      sessionLogger.error('Failed to start voice session', error);
      throw error;
    }
  }, [conversation, sessionId, personalityData, struggleType]);

  const disconnect = useCallback(async () => {
    try {
      await conversation.endSession();
      sessionLogger.info('Voice session ended');
    } catch (error) {
      sessionLogger.error('Failed to end voice session', error);
      throw error;
    }
  }, [conversation]);

  return {
    connect,
    disconnect,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    currentTask
  };
};
