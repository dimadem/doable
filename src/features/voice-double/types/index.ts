
export interface StatusIndicatorProps {
  status: 'idle' | 'connecting' | 'processing' | 'responding' | 'connected';
}

export interface WaveformVisualizationProps {
  isActive: boolean;
}

export interface VoiceAgentSettings {
  tts?: {
    voice_id?: string;
  };
}

export interface VoiceConfig {
  voice_name: string;
  agent_id: string;
  agent_settings: VoiceAgentSettings;
  api_key?: string;
}
