export function createCinematicSynth() {
  let ctx = null;
  const seen = new Set();

  function init() {
    if (ctx) return ctx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
    return ctx;
  }

  function tone(freq, duration, type = "sine", gainValue = 0.12, endFreq = null) {
    const audio = init();
    if (!audio) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration);
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  function playEvent(type, event = {}) {
    if (type === "grapple-fired") tone(900, 0.2, "sawtooth", 0.18, 150);
    else if (type === "grapple-latched") { tone(1200, 0.25, "sine", 0.18, 250); tone(80, 0.3, "triangle", 0.18); }
    else if (type === "released" || type === "wall-bounce") tone(110, 0.15, "triangle", 0.16, 45);
    else if (type === "restored") tone(440, 0.5, "sine", 0.08, 880);
    else if (type === "failed") tone(150, 1.0, "sawtooth", 0.22, 30);
    else if (type === "summit-reached") {
      tone(72, 1.35, "triangle", 0.18, 144);
      [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => setTimeout(() => tone(f, 0.48, "sine", 0.1, f * 1.5), i * 90));
      setTimeout(() => tone(1567.98, 0.9, "sine", 0.055, 2093), 580);
    }
    else if (type === "sector-broadcast-started") {
      tone(146.83, 0.72, "triangle", 0.12, 440);
      setTimeout(() => tone(587.33, 0.55, "sine", 0.08, 1174.66), 160);
    }
    else if (type === "sector-handshake-accepted") {
      tone(1046.5, 0.46, "sine", 0.09, 523.25);
      setTimeout(() => tone(783.99, 0.52, "triangle", 0.075, 1567.98), 150);
    }
    else if (type === "sector-opening-revealed") {
      tone(196, 0.62, "sawtooth", 0.07, 98);
      tone(659.25, 0.7, "sine", 0.065, 1318.5);
    }
    else if (type === "counterwind-pressure-surged") {
      const intensity = Math.max(0, Math.min(1, Number(event.gustIntensity ?? 0.5)));
      tone(138 + intensity * 54, 0.34 + intensity * 0.22, "sawtooth", 0.04 + intensity * 0.045, 72);
      tone(540 + intensity * 220, 0.22, "triangle", 0.035 + intensity * 0.03, 320);
    }
    else if (type === "counterwind-recovered") {
      tone(146.83, 0.65, "triangle", 0.09, 293.66);
      [440, 659.25, 880].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.42, "sine", 0.065, frequency * 1.25), index * 90));
    }
    else if (type === "post-rest-route-choice-opened") {
      tone(392, 0.38, "sine", 0.05, 587.33);
      setTimeout(() => tone(220, 0.42, "triangle", 0.05, 440), 90);
    }
    else if (type === "post-rest-route-choice-committed") {
      if (event.selectedRole === "pressure-shortcut") {
        tone(164.81, 0.55, "sawtooth", 0.08, 82.41);
        setTimeout(() => tone(659.25, 0.34, "triangle", 0.07, 987.77), 90);
      } else {
        tone(293.66, 0.48, "triangle", 0.07, 587.33);
        setTimeout(() => tone(783.99, 0.4, "sine", 0.055, 1046.5), 90);
      }
    }
    else if (type === "post-rest-route-choice-rejoined") {
      [392, 523.25, 783.99].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.32, "sine", 0.05, frequency * 1.2), index * 70));
    }
    else if (type === "post-rejoin-protected-grapple-consumed") {
      [329.63, 493.88, 783.99].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.36, "sine", 0.06, frequency * 1.22), index * 72));
    }
    else if (type === "post-rejoin-pressure-vented") {
      tone(174.61, 0.5, "sawtooth", 0.07, 87.31);
      [392, 587.33, 880].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.38, "triangle", 0.06, frequency * 1.18), 110 + index * 76));
    }
    else if (type === "post-stormlock-payoff-opened") {
      if (event.selectedRole === "pressure-shortcut") {
        tone(220, 0.44, "sawtooth", 0.07, 110);
        setTimeout(() => tone(987.77, 0.46, "triangle", 0.065, 1480), 90);
      } else {
        [440, 659.25, 1046.5].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.34, "sine", 0.058, frequency * 1.32), index * 64));
      }
    }
    else if (type === "post-stormlock-launch-window-fired") tone(1174.66, 0.3, "triangle", 0.075, 1760);
    else if (type === "post-stormlock-payoff-secured") {
      [523.25, 783.99, 1174.66].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.34, "sine", 0.06, frequency * 1.2), index * 70));
    }
  }

  return {
    update(snapshot, command = {}) {
      if (command.userGesture) init()?.resume?.();
      for (const event of snapshot?.recentEvents ?? []) {
        const key = `${event.at}:${event.type}:${event.targetId ?? event.reason ?? event.sector ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        playEvent(event.type, event);
      }
      if (seen.size > 80) {
        const keep = [...seen].slice(-40);
        seen.clear();
        keep.forEach((key) => seen.add(key));
      }
    }
  };
}
