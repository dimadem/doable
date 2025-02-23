
import React, { useEffect } from 'react';
import { AppHeader } from '@/components/layouts/AppHeader';

const VoiceDouble: React.FC = () => {
  useEffect(() => {
    // Create and append the script element
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Cleanup on component unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      <AppHeader title="voice double" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <elevenlabs-convai 
          agent-id="TGp0ve1q0XQurppvTzrO"
          className="w-full max-w-xl h-[600px]"
        />
      </main>
    </div>
  );
};

export default VoiceDouble;
