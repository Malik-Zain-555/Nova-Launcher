/**
 * Offline Web Audio Ambient Sound and Lo-Fi Generator
 * Uses Web Audio API synthesizers and noise buffers so it works offline with zero external audio assets!
 */

export class FocusAudioEngine {
  private static ctx: AudioContext | null = null;
  private static currentSource: AudioNode | null = null;
  private static gainNode: GainNode | null = null;
  private static isPlaying: boolean = false;
  private static currentType: string = 'none';

  private static getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public static play(type: 'rain' | 'white-noise' | 'lo-fi', volume: number = 0.5): void {
    this.stop();
    const ctx = this.getContext();
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    if (type === 'white-noise' || type === 'rain') {
      // Generate 5-second loopable noise buffer
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink / Brown noise filter for rain texture
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else {
          data[i] = white * 0.15;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter for rain warmth
      if (type === 'rain') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(this.gainNode);
      } else {
        noiseSource.connect(this.gainNode);
      }

      noiseSource.start();
      this.currentSource = noiseSource;
    } else if (type === 'lo-fi') {
      // Warm chord ambient pad synthesizer
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.gainNode);

      osc1.start();
      osc2.start();
      this.currentSource = osc1;
    }

    this.isPlaying = true;
    this.currentType = type;
  }

  public static setVolume(volume: number): void {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public static stop(): void {
    if (this.currentSource) {
      try {
        (this.currentSource as any).stop?.();
        this.currentSource.disconnect();
      } catch {}
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.currentType = 'none';
  }

  public static getStatus(): { isPlaying: boolean; type: string } {
    return { isPlaying: this.isPlaying, type: this.currentType };
  }
}
