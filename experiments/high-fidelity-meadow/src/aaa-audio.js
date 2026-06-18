export function createAudioEngine(audio) {
  return {
    start: async () => {},
    getState: () => ({ enabled: false, section: audio?.sections?.[0]?.id ?? "silent" })
  };
}
