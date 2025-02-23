
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useConversation } from '@11labs/react';

export const VoiceDouble = () => {
  const conversation = useConversation();

  const handleClick = async () => {
    try {
      await conversation.startSession({
        agentId: 'your_agent_id_here' // Replace with your actual agent ID
      });
      console.log('Started conversation');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono">
      <Card className="w-full max-w-md p-8 bg-black border border-white">
        <div className="flex flex-col items-center gap-8">
          <Button
            onClick={handleClick}
            className="w-32 h-32 rounded-full bg-black border-2 border-white hover:bg-white hover:text-black"
          >
            <Mic className="w-8 h-8" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
