'use client';

class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private initialized: boolean = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
      this.masterGain.connect(this.ctx.destination);

      this.startAmbient();
      this.initialized = true;

      // Unsuspend if needed
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.masterGain) return;

    // A low drone using a triangle wave
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'triangle';
    this.ambientOsc.frequency.value = 55; // Low A1

    // Add a lowpass filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 150;
    this.filter.Q.value = 2;

    // LFO to slowly sweep the filter for a breathing effect
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.05; // very slow
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 100; // Sweep +- 100Hz
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.2; // very quiet

    this.ambientOsc.connect(this.filter);
    this.filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc.start();
    this.lfo.start();
  }

  public playClick() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playLockOn() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    // Rapid descending chirp
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);

    // Apply a quick lowpass so the square wave isn't too harsh
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx?.currentTime || 0, 0.05);
    }
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
