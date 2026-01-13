/**
 * Sound Manager
 *
 * Handles playing sound effects for game actions.
 * Uses Web Audio API for low-latency playback.
 */

import { warn } from '../logging';

export type SoundEffect =
  | 'forward'
  | 'backward'
  | 'turnLeft'
  | 'turnRight'
  | 'collect'
  | 'blocked'
  | 'win'
  | 'error'
  | 'countdown'
  | 'battleStart'
  | 'adventureStart'
  | 'dragStart'
  | 'drop';

class SoundManagerClass {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundEffect, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;
  private initialized: boolean = false;
  private isUnlocked: boolean = false;
  private pendingSounds: SoundEffect[] = [];

  /**
   * Initialize the audio context (must be called during user interaction)
   * This is synchronous to maintain the user gesture context required by browsers
   */
  init(): void {
    if (this.initialized) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error('AudioContext not supported');
      this.audioContext = new AudioContextClass();

      // Listen for state changes to know when audio is truly unlocked
      this.audioContext.onstatechange = () => {
        if (this.audioContext?.state === 'running' && !this.isUnlocked) {
          this.isUnlocked = true;
          // Play any pending sounds
          this.flushPendingSounds();
        }
      };

      // Check if already running (desktop browsers)
      if (this.audioContext.state === 'running') {
        this.isUnlocked = true;
      }

      this.loadSounds();
      this.initialized = true;

      // Try to unlock audio on iOS
      this.unlockAudio();
    } catch (e) {
      warn('Failed to initialize audio', { error: e }, 'SoundManager');
    }
  }

  /**
   * Unlock audio on iOS by resuming context and playing a silent buffer
   */
  private unlockAudio(): void {
    if (!this.audioContext) return;

    // Resume if suspended - this must happen during a user gesture
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {
        // Ignore errors - will retry on next user interaction
      });
    }

    // Create and play a silent buffer to unlock iOS audio
    try {
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Play all pending sounds that were queued while context was suspended
   */
  private flushPendingSounds(): void {
    const sounds = this.pendingSounds.splice(0, this.pendingSounds.length);
    sounds.forEach((effect) => {
      const buffer = this.sounds.get(effect);
      if (buffer) {
        this.playBuffer(buffer);
      }
    });
  }

  /**
   * Generate and load all sound effects (synchronous)
   */
  private loadSounds(): void {
    if (!this.audioContext) return;

    // Generate synthesized sounds
    this.sounds.set('forward', this.generateTone(440, 0.1, 'sine', 0.3));
    this.sounds.set('backward', this.generateTone(330, 0.1, 'sine', 0.3));
    this.sounds.set('turnLeft', this.generateTone(523, 0.08, 'square', 0.2));
    this.sounds.set('turnRight', this.generateTone(587, 0.08, 'square', 0.2));
    this.sounds.set('collect', this.generateCollectSound());
    this.sounds.set('blocked', this.generateBlockedSound());
    this.sounds.set('win', this.generateWinSound());
    this.sounds.set('error', this.generateErrorSound());
    this.sounds.set('countdown', this.generateCountdownSound());
    this.sounds.set('battleStart', this.generateBattleStartSound());
    this.sounds.set('adventureStart', this.generateAdventureStartSound());
    this.sounds.set('dragStart', this.generateDragStartSound());
    this.sounds.set('drop', this.generateDropSound());
  }

  /**
   * Generate a light pickup/click sound for drag start
   */
  private generateDragStartSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.08;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Quick high-pitched click
    const freq = 1200;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-t * 50);
      data[i] = sample * 0.25 * envelope;
    }

    return buffer;
  }

  /**
   * Generate a satisfying placement sound for drop
   */
  private generateDropSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.12;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Two-tone drop: quick descending
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = 800 - t * 2000; // Descend from 800 to lower
      const sample = Math.sin(2 * Math.PI * Math.max(200, freq) * t);
      const envelope = Math.exp(-t * 25);
      data[i] = sample * 0.3 * envelope;
    }

    return buffer;
  }

  /**
   * Generate a simple tone
   */
  private generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = Math.abs(((4 * frequency * t) % 4) - 2) - 1;
          break;
        case 'sawtooth':
          sample = 2 * ((frequency * t) % 1) - 1;
          break;
      }

      // Apply envelope (fade out)
      const envelope = 1 - i / length;
      data[i] = sample * volume * envelope;
    }

    return buffer;
  }

  /**
   * Generate a cheerful collect sound (ascending notes)
   */
  private generateCollectSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.25;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const frequencies = [523, 659, 784]; // C5, E5, G5
    const noteDuration = duration / frequencies.length;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.min(Math.floor(t / noteDuration), frequencies.length - 1);
      const freq = frequencies[noteIndex];
      const noteT = t - noteIndex * noteDuration;

      const sample = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.max(0, 1 - (noteT / noteDuration) * 0.5);

      data[i] = sample * 0.3 * envelope;
    }

    return buffer;
  }

  /**
   * Generate a blocked/bump sound
   */
  private generateBlockedSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.15;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Low frequency thump with noise
      const freq = 100 * Math.exp(-t * 20);
      const sample = Math.sin(2 * Math.PI * freq * t) + (Math.random() * 2 - 1) * 0.3;
      const envelope = Math.exp(-t * 15);

      data[i] = sample * 0.4 * envelope;
    }

    return buffer;
  }

  /**
   * Generate a victory fanfare
   */
  private generateWinSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.6;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Victory arpeggio: C5, E5, G5, C6
    const frequencies = [523, 659, 784, 1047];
    const noteDuration = duration / frequencies.length;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.min(Math.floor(t / noteDuration), frequencies.length - 1);
      const freq = frequencies[noteIndex];

      const sample =
        Math.sin(2 * Math.PI * freq * t) * 0.5 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.25;
      const envelope = Math.max(0, 1 - ((t - noteIndex * noteDuration) / noteDuration) * 0.3);

      data[i] = sample * 0.35 * envelope;
    }

    return buffer;
  }

  /**
   * Generate an error/fail sound
   */
  private generateErrorSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.3;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Descending tone
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = 400 * Math.exp(-t * 3);
      const sample = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-t * 5);

      data[i] = sample * 0.3 * envelope;
    }

    return buffer;
  }

  /**
   * Generate a countdown beep sound
   */
  private generateCountdownSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.15;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Simple beep at 880Hz (A5)
    const freq = 880;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * freq * t);
      // Quick attack, medium decay
      const attack = Math.min(1, t * 50);
      const decay = Math.exp(-(t - 0.02) * 10);
      const envelope = attack * decay;

      data[i] = sample * 0.4 * envelope;
    }

    return buffer;
  }

  /**
   * Generate a battle start sound (energetic ascending)
   */
  private generateBattleStartSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.4;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Quick ascending arpeggio: C5, E5, G5, C6 (fast)
    const frequencies = [523, 659, 784, 1047];
    const noteDuration = duration / frequencies.length;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.min(Math.floor(t / noteDuration), frequencies.length - 1);
      const freq = frequencies[noteIndex];
      const noteT = t - noteIndex * noteDuration;

      // Add harmonics for richer sound
      const sample =
        Math.sin(2 * Math.PI * freq * t) * 0.6 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.3 +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.1;

      // Quick attack and sustain
      const attack = Math.min(1, noteT * 100);
      const sustain = Math.max(0, 1 - (noteT / noteDuration) * 0.2);
      const envelope = attack * sustain;

      data[i] = sample * 0.4 * envelope;
    }

    return buffer;
  }

  /**
   * Generate an exciting adventure start sound (magical chime)
   */
  private generateAdventureStartSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const duration = 0.8;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Magical ascending chime: C5, E5, G5, B5, C6 with sparkle
    const frequencies = [523, 659, 784, 988, 1047];
    const noteDuration = duration / frequencies.length;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.min(Math.floor(t / noteDuration), frequencies.length - 1);
      const freq = frequencies[noteIndex];
      const noteT = t - noteIndex * noteDuration;

      // Main tone with harmonics for bell-like sound
      const sample =
        Math.sin(2 * Math.PI * freq * t) * 0.5 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.15 +
        Math.sin(2 * Math.PI * freq * 4 * t) * 0.1;

      // Add shimmer/sparkle effect
      const shimmer = Math.sin(2 * Math.PI * freq * 5.5 * t) * 0.05 * Math.sin(t * 30);

      // Bell-like envelope with quick attack and slow decay
      const attack = Math.min(1, noteT * 80);
      const decay = Math.exp(-noteT * 3);
      const envelope = attack * decay;

      // Overall fade out
      const masterFade = 1 - (t / duration) * 0.3;

      data[i] = (sample + shimmer) * 0.45 * envelope * masterFade;
    }

    return buffer;
  }

  /**
   * Play a sound effect
   * Will auto-initialize on first call (must be during user gesture)
   */
  play(effect: SoundEffect): void {
    if (!this.enabled) return;

    // Initialize on first play (synchronous to maintain user gesture context)
    if (!this.initialized) {
      this.init();
    }

    if (!this.audioContext || !this.initialized) return;

    // Always try to unlock on every user interaction (iOS requires this)
    this.unlockAudio();

    // Check actual state in case onstatechange didn't fire
    if (!this.isUnlocked && this.audioContext.state === 'running') {
      this.isUnlocked = true;
      this.flushPendingSounds();
    }

    const buffer = this.sounds.get(effect);
    if (!buffer) return;

    // If audio is unlocked (context is running), play immediately
    if (this.isUnlocked) {
      this.playBuffer(buffer);
      return;
    }

    // Queue the sound to play when context becomes running
    // Only keep last few pending sounds to avoid too many queued up
    if (this.pendingSounds.length < 3) {
      this.pendingSounds.push(effect);
    }
  }

  /**
   * Internal method to play an audio buffer
   */
  private playBuffer(buffer: AudioBuffer): void {
    if (!this.audioContext) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (e) {
      warn('Failed to play sound', { error: e }, 'SoundManager');
    }
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
export const SoundManager = new SoundManagerClass();
