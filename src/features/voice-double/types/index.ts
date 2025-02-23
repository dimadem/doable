
export interface StatusIndicatorProps {
  status: 'idle' | 'connecting' | 'connected' | 'error';
}

export interface VoiceConfig {
  voice_name: string;
  agent_id: string;
}
