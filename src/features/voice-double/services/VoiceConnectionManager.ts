
import { EventEmitter } from 'events';

interface VoiceConnectionConfig {
  agentId: string;
  apiKey: string;
  voiceId?: string;
  debug?: boolean;
}

interface AudioConfig {
  input: {
    enabled: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
    noiseSuppression: boolean;
  };
  output: {
    enabled: boolean;
    format: string;
    playbackMuted: boolean;
  };
}

export class VoiceConnectionManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private audioStream: MediaStream | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  constructor(private config: VoiceConnectionConfig) {
    super();
  }

  async connect() {
    try {
      await this.setupAudioStream();
      await this.establishWebSocketConnection();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async setupAudioStream() {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });
      this.emit('audioStreamReady', this.audioStream);
    } catch (error) {
      this.emit('error', new Error('Failed to access microphone'));
      throw error;
    }
  }

  private async establishWebSocketConnection() {
    const ws = new WebSocket('wss://api.elevenlabs.io/v1/text-to-speech/stream');
    this.ws = ws;

    ws.onopen = () => {
      this.sendInitialConfiguration();
      this.emit('connected');
      this.reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        this.emit('error', new Error('Failed to process message'));
      }
    };

    ws.onerror = (error) => {
      this.handleWebSocketError(error);
    };

    ws.onclose = (event) => {
      this.handleWebSocketClose(event);
    };
  }

  private sendInitialConfiguration() {
    if (!this.ws) return;

    this.ws.send(JSON.stringify({
      type: "start",
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      },
      xi_api_key: this.config.apiKey,
      voice_id: this.config.voiceId,
      debug: this.config.debug
    }));
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'speech':
        this.emit('audioData', data.audio);
        break;
      case 'error':
        this.emit('error', new Error(data.message));
        break;
      default:
        if (this.config.debug) {
          console.log('Received message:', data);
        }
    }
  }

  private handleWebSocketError(error: Event) {
    this.emit('error', error);
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.attemptReconnect();
    }
  }

  private handleWebSocketClose(event: CloseEvent) {
    this.emit('disconnected', {
      clean: event.wasClean,
      code: event.code,
      reason: event.reason
    });
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    setTimeout(() => this.establishWebSocketConnection(), delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }
}
