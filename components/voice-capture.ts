/**
 * Microphone → short 16 kHz WAV pieces, cut at natural pauses, for server transcription.
 * Nothing is recorded to a file: samples live in memory only until a piece is sent, then are dropped.
 */
export type Piece = { wav: Blob; seconds: number };

const RATE = 16000;
const MIN_PIECE = 1.0; // s of audio before a pause may end a piece
const MAX_PIECE = 8.0; // s: cut regardless, so text keeps flowing during long sentences
const PAUSE = 0.45; // s of quiet that ends a piece
const PRE_ROLL = 0.3; // s kept before speech starts, so the first syllable is not clipped

export function encodeWav(samples: Float32Array): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE");
  w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

export class PauseChunker {
  private ctx: AudioContext;
  private src: MediaStreamAudioSourceNode;
  private proc: ScriptProcessorNode;
  private ratio: number;
  private frac = 0;
  private acc = 0;
  private accN = 0;
  private piece: number[] = [];
  private pre: number[] = [];
  private voiced = 0;
  private quiet = 0;
  private floor = 0.004;
  level = 0;

  constructor(stream: MediaStream, private onPiece: (p: Piece) => void) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.ratio = this.ctx.sampleRate / RATE;
    this.src = this.ctx.createMediaStreamSource(stream);
    this.proc = this.ctx.createScriptProcessor(2048, 1, 1);
    this.proc.onaudioprocess = (e) => this.feed(e.inputBuffer.getChannelData(0));
    this.src.connect(this.proc);
    this.proc.connect(this.ctx.destination); // outputs silence; needed for the node to run
    void this.ctx.resume();
  }

  private feed(input: Float32Array) {
    // Average-and-decimate to 16 kHz.
    const out: number[] = [];
    for (let i = 0; i < input.length; i++) {
      this.acc += input[i];
      this.accN++;
      this.frac += 1;
      if (this.frac >= this.ratio) {
        this.frac -= this.ratio;
        out.push(this.acc / this.accN);
        this.acc = 0;
        this.accN = 0;
      }
    }
    if (!out.length) return;
    let e = 0;
    for (const s of out) e += s * s;
    const rms = Math.sqrt(e / out.length);
    this.level = rms;
    const dur = out.length / RATE;
    const speaking = rms > Math.max(0.012, this.floor * 3.2);
    if (!speaking) this.floor = this.floor * 0.95 + rms * 0.05; // track background noise slowly

    if (!this.piece.length && !speaking) {
      // Waiting for speech: keep a short rolling pre-roll.
      this.pre.push(...out);
      const keep = Math.round(PRE_ROLL * RATE);
      if (this.pre.length > keep) this.pre.splice(0, this.pre.length - keep);
      return;
    }
    if (!this.piece.length) {
      this.piece = this.pre.splice(0);
      this.voiced = 0;
      this.quiet = 0;
    }
    this.piece.push(...out);
    if (speaking) {
      this.voiced += dur;
      this.quiet = 0;
    } else this.quiet += dur;

    const len = this.piece.length / RATE;
    if ((len >= MIN_PIECE && this.quiet >= PAUSE) || len >= MAX_PIECE) this.cut();
    else if (this.quiet >= 1.5 && this.voiced < 0.25) this.drop(); // a click or a cough, not speech
  }

  private cut() {
    const samples = Float32Array.from(this.piece);
    const seconds = samples.length / RATE;
    const enough = this.voiced >= 0.25;
    this.piece = [];
    this.voiced = 0;
    this.quiet = 0;
    if (enough) this.onPiece({ wav: encodeWav(samples), seconds });
  }

  private drop() {
    this.piece = [];
    this.voiced = 0;
    this.quiet = 0;
  }

  /** Send whatever was being said when Stop was pressed. */
  flush() {
    if (this.piece.length) this.cut();
  }

  async close() {
    try {
      this.proc.onaudioprocess = null;
      this.src.disconnect();
      this.proc.disconnect();
      await this.ctx.close();
    } catch {}
  }
}
