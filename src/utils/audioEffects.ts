// Interactive Web Audio Sound Effects System for 3D Web Experience
// Pure Web Audio API synthesized sounds - 100% reliable, zero external files, instantaneous latency

class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_sound_effects');
      this.enabled = saved !== null ? saved === 'true' : true;
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_sound_effects', String(val));
      window.dispatchEvent(new CustomEvent('sound-toggle-changed', { detail: { enabled: val } }));
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playSuccess();
    }
    return this.enabled;
  }

  // 1. Subtle High-Tech Hover Tick (Muted per user request)
  public playHover() {}

  // 2. Tactile Click Sound (Muted per user request)
  public playClick() {}

  // 3. 3D Card Flip / Whoosh Sound (Muted per user request)
  public playWhoosh() {}

  // 4. Add to Cart Futuristic Holographic Chime (Active - sole site sound per request)
  public playAddToCart() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.34);
      });
    } catch {}
  }

  // 5. Holographic Modal Open (Muted per user request)
  public playModalOpen() {}

  // 6. Modal Close / Dismiss (Muted per user request)
  public playModalClose() {}

  // 7. Success / Celebration Chime (Muted per user request)
  public playSuccess() {}
}

export const soundFX = new SoundSystem();
