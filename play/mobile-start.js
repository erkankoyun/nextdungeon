(() => {
  const startButton = document.getElementById('start-game');
  const frame = document.querySelector('.game-frame');
  if (!startButton || !frame) return;

  const isTouchDevice = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

  startButton.addEventListener('click', async () => {
    if (!isTouchDevice()) return;

    try {
      if (!document.fullscreenElement && frame.requestFullscreen) {
        await frame.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch (_) {
      // Fullscreen support varies by mobile browser; normal FIT mode remains the fallback.
    }

    try {
      if (screen.orientation?.lock) await screen.orientation.lock('landscape');
    } catch (_) {
      // Orientation locking is optional and browser-dependent.
    }
  });
})();
