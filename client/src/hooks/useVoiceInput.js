import { useCallback, useEffect, useRef, useState } from 'react';

const getRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function isVoiceSupported() {
  return Boolean(getRecognition());
}

export function useVoiceInput({ lang = 'en-IN', onResult } = {}) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript?.trim();
      if (transcript && onResult) onResult(transcript);
    };
    rec.onerror = (e) => {
      setError(e.error || 'voice-error');
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* noop */ }
    };
  }, [lang, onResult]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      setError('unsupported');
      return;
    }
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      // Already started — ignore
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
    }
    setListening(false);
  }, []);

  return { start, stop, listening, error, supported: Boolean(getRecognition()) };
}
