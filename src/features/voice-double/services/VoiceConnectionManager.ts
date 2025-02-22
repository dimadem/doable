
type EventCallback = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events[event];
    if (callbacks) {
      this.events[event] = callbacks.filter(cb => cb !== callback);
    }
  }
}

interface VoiceConnectionConfig {
  agentId: string;
  apiKey: string;
  voiceId?: string;
  debug?: boolean;
}

export class VoiceConnectionManager extends SimpleEventEmitter {
  private ws: WebSocket | null = null;
  private audioStream: MediaStream | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly ELEVENLABS_WS_URL = 'wss://api.elevenlabs.io/v1/text-to-speech/stream';

  constructor(private config: VoiceConnectionConfig) {
    super();
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
  }

  async connect() {
    try {
      await this.setupAudioStream();
      await this.establishWebSocketConnection();
    } catch (error) {
      console.error('Connection error:', error);
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
      console.error('Microphone access error:', error);
      this.emit('error', new Error('Failed to access microphone'));
      throw error;
    }
  }

  private async establishWebSocketConnection() {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.ELEVENLABS_WS_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.sendInitialConfiguration();
        this.emit('connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Message parsing error:', error);
          this.emit('error', new Error('Failed to process message'));
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleWebSocketError(error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event);
        this.handleWebSocketClose(event);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.emit('error', new Error('Failed to establish WebSocket connection'));
      throw error;
    }
  }

  private sendInitialConfiguration() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not ready');
      return;
    }

    const config = {
      type: "start",
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      },
      xi_api_key: this.config.apiKey,
      voice_id: this.config.voiceId || "21m00Tcm4TlvDq8ikWAM", // Default voice if none provided
    };

    console.log('Sending initial configuration');
    this.ws.send(JSON.stringify(config));
  }

  private handleWebSocketMessage(data: any) {
    if (this.config.debug) {
      console.log('Received message:', data);
    }

    switch (data.type) {
      case 'speech':
        this.emit('audioData', data.audio);
        break;
      case 'error':
        console.error('Server error:', data);
        this.emit('error', new Error(data.message));
        break;
      default:
        if (this.config.debug) {
          console.log('Unhandled message type:', data.type);
        }
    }
  }

  private handleWebSocketError(error: Event) {
    console.error('WebSocket error occurred:', error);
    this.emit('error', error);
    
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.attemptReconnect();
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleWebSocketClose(event: CloseEvent) {
    console.log('WebSocket closed:', event);
    this.emit('disconnected', {
      clean: event.wasClean,
      code: event.code,
      reason: event.reason || 'Connection closed'
    });

    if (!event.wasClean && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    setTimeout(() => this.establishWebSocketConnection(), delay);
  }

  disconnect() {
    console.log('Disconnecting...');
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
