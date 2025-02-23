
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/pageTransitions';
import { AppHeader } from '@/components/layouts/AppHeader';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { VoiceStatus } from '../components/VoiceStatus';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';
import { sessionLogger } from '@/utils/sessionLogger';
import PomodoroTimer from '@/components/ui/PomodoroTimer';

const VoiceDouble = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const mountedRef = useRef(true);

  const conversation = useConversation({
    onConnect: () => {
      sessionLogger.info('Voice connection established');
      setIsConnecting(false);
      setIsActive(true);
    },
    onDisconnect: () => {
      sessionLogger.info('Voice connection closed');
      if (mountedRef.current) {
        setIsActive(false);
        setIsConnecting(false);
      }
    },
    onError: (error) => {
      sessionLogger.error('Voice connection error', error);
      setIsActive(false);
      setIsConnecting(false);
      
      // Check for specific error types
      if (error instanceof CloseEvent && error.code === 3000) {
        toast({
          variant: "destructive",
          title: "Authorization Error",
          description: "Failed to authorize the voice connection. Please try again."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect to voice service"
        });
      }
    },
    onMessage: (message) => {
      sessionLogger.info('Voice message received', message);
    }
  });

  const [currentTask, setCurrentTask] = useState('');
  const timerRef = useRef(null);

  const startConnection = useCallback(async () => {
    try {

      // First, ensure we have microphone access
      await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      const savedContext = JSON.parse(localStorage.getItem('pomodoro_context') || 'null');
      
      await conversation.startSession({
        agentId: '97WJSmssV4XbURx8LY7M',
        clientTools: {
          set_timer_duration: async ({ timer_duration }) => {
            if (!timerRef.current) return 'Timer not initialized';
            timerRef.current.setDuration(parseInt(timer_duration));
            return `Timer set to ${timer_duration} minutes`;
          },
          set_timer_state: async ({ timer_on }) => {
            timer_on ? timerRef.current?.start() : timerRef.current?.stop();
            return `Timer ${timer_on ? 'started' : 'stopped'}`;
          },
          set_session_context: async ({ ok_to_close, task_description }) => {
            setCurrentTask(task_description);
            const sessionData = {
              taskDescription: task_description,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('pomodoro_context', JSON.stringify(sessionData));
            if (ok_to_close) {
              await conversation.endSession();
            }
            return "Context stored";
          }
        },
        overrides: {
          agent: {
            prompt: {
              prompt: `
                You are an ADHD coaching assistant helping a user to deal with start inertia through a Pomodoro session.
                ${savedContext ? `Previous context: User was working on ${savedContext.taskDescription}.` : ''} 
                You are supportive, yet speak succinctly to save user's time on information processing.

                IMPORTANT: Every time when user mentions or reformulates their task:
                1. Call set_session_context with:
                  - task_description: their task
                  - ok_to_close: false

                IMPORTANT: To control the timer, always follow these exact steps:
                1. First set_timer_duration with parameter timer_duration=X (where X is the minutes)
                2. Wait for confirmation
                3. Ask the user if any help is needed before starting the timer.
                4. If no help needed, call set_timer_state with parameter timer_on=true to start
                4. To pause, call set_timer_state with timer_on=false

                IMPORTANT: If the timer is started and the user doesn't need any help 
                1. Inform the user about you starting to work in parallel on your own tasks and suggest to tap you on the shoulder if any help needed.
                2. Use set_session_context to update ok_to_close=true.
              `
            },
            firstMessage: "Hi! I'm here to help you focus. What would you like to work on?"
          }
        }
      });
      
      sessionLogger.info('Started conversation successfully');
    } catch (error) {
      console.error('Error starting connection:', error);
      setIsActive(false);
      setIsConnecting(false);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use the voice feature"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect to voice service"
        });
      }
    }
  }, [conversation]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleToggleVoice = useCallback(async () => {
    if (isConnecting) return;

    try {
      if (isActive) {
        setIsConnecting(true);
        await conversation.endSession();
        setIsActive(false);
        setIsConnecting(false);
      } else {
        setIsConnecting(true);
        await startConnection();
      }
    } catch (error) {
      sessionLogger.error('Voice connection error:', error);
      setIsActive(false);
      setIsConnecting(false);
    }
  }, [conversation, isActive, isConnecting, startConnection]);

  return (
    <motion.div
      className="min-h-[100svh] bg-black text-white flex flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <AppHeader title="Voice Double" />
      
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="text-sm text-gray-400">
          {currentTask && `Current Task: ${currentTask}`}
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <PomodoroTimer ref={timerRef} defaultDuration={25} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <VoiceMicButton
              isActive={isActive}
              isConnecting={isConnecting}
              onClick={handleToggleVoice}
            />
            
            <VoiceStatus 
              status={isActive ? 'connected' : 'idle'}
              isSpeaking={conversation.isSpeaking}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceDouble;
