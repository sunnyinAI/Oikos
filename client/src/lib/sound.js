let audioCtx;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    audioCtx = new Context();
  }
  return audioCtx;
};

const playTone = (ctx, start, freq, duration, gain) => {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0.001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

export const playCoinSound = async (kind = 'credit') => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const now = ctx.currentTime;
  if (kind === 'debit') {
    playTone(ctx, now, 620, 0.08, 0.08);
    playTone(ctx, now + 0.06, 390, 0.12, 0.06);
    return;
  }

  playTone(ctx, now, 720, 0.08, 0.09);
  playTone(ctx, now + 0.05, 980, 0.12, 0.07);
};
