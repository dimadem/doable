
import { useCallback, useState } from 'react';
import { useConversation } from '@11labs/react';
import { sessionLogger } from '@/utils/sessionLogger';
import { useSession } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/use-toast';

const PUBLIC_AGENT_ID = 'TGp0ve1q0XQurppvTzrO';
const SESSION_CONTEXT_KEY = 'voice_session_context';

interface SessionContext {
  taskDescription?: string;
  struggleType?: string;
  lastUpdate: string;
}

export const useVoiceConnection = () => {
  const { personalityData, sessionId, struggleType } = useSession();
  const [currentTask, setCurrentTask] = useState<string>();
  
  const loadSavedContext = (): SessionContext | null => {
    const saved = localStorage.getItem(SESSION_CONTEXT_KEY);
    if (saved) {
      const context = JSON.parse(saved);
      sessionLogger.info('Loading saved task context', {
        savedTask: context.taskDescription,
        sessionId,
        struggleType,
        timestamp: new Date().toISOString()
      });
      return context;
    }
    sessionLogger.info('No saved task context found', { sessionId });
    return null;
  };

  const saveContext = (taskDescription: string) => {
    sessionLogger.info('Updating task context', {
      previousTask: currentTask,
      newTask: taskDescription,
      sessionId,
      struggleType,
      timestamp: new Date().toISOString()
    });

    const context: SessionContext = {
      taskDescription,
      struggleType,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_CONTEXT_KEY, JSON.stringify(context));
    setCurrentTask(taskDescription);
    
    sessionLogger.info('Task context saved successfully', {
      taskDescription,
      sessionId,
      struggleType
    });
  };

  const conversation = useConversation({
    clientTools: {
      set_task: async ({ end_conversation, task_description }) => {
        sessionLogger.info('Task identified by agent', { 
          task_description,
          sessionId,
          struggleType,
          timestamp: new Date().toISOString()
        });

        saveContext(task_description);
        
        if (end_conversation) {
          sessionLogger.info('Agent requesting session end', {
            task_description,
            sessionId,
            timestamp: new Date().toISOString()
          });
          await conversation.endSession();
        }

        return "Task context stored successfully";
      }
    },
    onConnect: () => {
      sessionLogger.info('Voice connection established', { sessionId });
      toast({
        title: "Connected",
        description: "Voice connection established"
      });
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed', { sessionId });
      toast({
        title: "Disconnected",
        description: "Voice connection closed"
      });
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', { error, sessionId });
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish voice connection"
      });
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', { message, sessionId });
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

      await navigator.mediaDevices.getUserMedia({ audio: true });
      const savedContext = loadSavedContext();
      
      sessionLogger.info('Starting voice session', { 
        sessionId,
        hasTaskDescription: !!savedContext?.taskDescription,
        struggleType
      });

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
      sessionLogger.info('Voice session ended', { sessionId });
    } catch (error) {
      sessionLogger.error('Failed to end voice session', error);
      throw error;
    }
  }, [conversation, sessionId]);

  return {
    connect,
    disconnect,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    currentTask
  };
};
