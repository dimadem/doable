
export class AudioQueue {
  private queue: AudioBuffer[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  async addToQueue(audioData: string) {
    try {
      const buffer = await this.decodeAudioData(audioData);
      this.queue.push(buffer);
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (error) {
      console.error('Error adding audio to queue:', error);
    }
  }

  private async decodeAudioData(base64Audio: string): Promise<AudioBuffer> {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return await this.audioContext.decodeAudioData(bytes.buffer);
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const buffer = this.queue.shift()!;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.onended = () => this.playNext();
    source.start(0);
  }

  clear() {
    this.queue = [];
    this.isPlaying = false;
  }

  dispose() {
    this.clear();
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
