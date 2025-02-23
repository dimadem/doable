
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const VoiceDouble = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const { toast } = useToast();
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      toast({
        title: "Connected",
        description: "Voice connection established",
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsActive(false);
      toast({
        title: "Disconnected",
        description: "Voice connection ended",
      });
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Connection error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Connection error occurred",
      });
      setIsActive(false);
    }
  });

  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (error) {
        console.error('Microphone permission error:', error);
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice features",
        });
      }
    };

    checkMicPermission();
  }, [toast]);

  const handleClick = async () => {
    try {
      if (!hasMicPermission) {
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice features",
        });
        return;
      }

      if (isActive) {
        await conversation.endSession();
        setIsActive(false);
        console.log('Ended conversation');
      } else {
        const { data, error: signedUrlError } = await supabase.functions.invoke('get-eleven-labs-key');
        
        if (signedUrlError) {
          throw new Error('Failed to get signed URL');
        }

        if (!data?.signed_url || !data?.agent_id) {
          throw new Error('Missing required connection data');
        }

        console.log('Starting session with:', {
          agentId: data.agent_id,
          signedUrl: data.signed_url
        });
        
        await conversation.startSession({
          agentId: data.agent_id,
          url: data.signed_url
        });
        
        setIsActive(true);
        console.log('Started conversation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect",
      });
      setIsActive(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-mono">
      <AppHeader title="Voice Double" />
      <div className="flex-1 flex items-center justify-center">
        <Button
          onClick={handleClick}
          className="w-32 h-32 rounded-full bg-black border-2 border-white hover:bg-white hover:text-black transition-all duration-300"
          disabled={!hasMicPermission}
        >
          {isActive ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>
      </div>
    </div>
  );
};
