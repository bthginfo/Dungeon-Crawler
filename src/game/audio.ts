/** Small original adaptive soundtrack and feedback; audio starts only on a user gesture. */
export class AudioDirector {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private beat = 0;
  unlock() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.music = this.context.createGain();
      this.master.gain.value = 0.108;
      this.music.gain.value = 0.1925;
      this.master.connect(this.context.destination);
      this.music.connect(this.master);
      this.timer = setInterval(() => this.pulse(), 450);
    }
    void this.context.resume();
  }
  volume(sound: number, music: number) {
    if (this.master) this.master.gain.value = sound * 0.18;
    if (this.music) this.music.gain.value = music * 0.55;
  }
  private pulse() {
    if (!this.context || !this.music || this.context.state !== 'running') return;
    const notes = [110, 164.81, 130.81, 146.83, 110, 196, 130.81, 82.41];
    this.tone(notes[this.beat++ % 8], 0.8, 'triangle', this.music, 0.22);
  }
  private tone(hz: number, length: number, type: OscillatorType, target?: AudioNode, volume = 0.6) {
    if (!this.context || !this.master) return;
    const o = this.context.createOscillator(),
      g = this.context.createGain(),
      now = this.context.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(hz, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(volume, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + length);
    o.connect(g);
    g.connect(target ?? this.master);
    o.start(now);
    o.stop(now + length + 0.01);
  }
  play(kind: 'attack' | 'hit' | 'loot' | 'heal' | 'dodge' | 'death' | 'boss' | 'click') {
    const sounds = {
      attack: [180, 0.09, 'sawtooth'],
      hit: [72, 0.12, 'square'],
      loot: [660, 0.25, 'triangle'],
      heal: [440, 0.4, 'sine'],
      dodge: [260, 0.08, 'triangle'],
      death: [55, 0.8, 'sawtooth'],
      boss: [82, 0.9, 'square'],
      click: [360, 0.05, 'sine'],
    } as const;
    const [n, d, t] = sounds[kind];
    this.tone(n, d, t);
  }
  suspend() {
    void this.context?.suspend();
  }
  destroy() {
    if (this.timer) clearInterval(this.timer);
    void this.context?.close();
  }
}
