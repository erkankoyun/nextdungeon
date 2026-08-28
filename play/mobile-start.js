(() => {
  const startButton = document.getElementById('start-game');
  const frame = document.querySelector('.game-frame');
  if (!startButton || !frame) return;

  const isTouchDevice = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isIPhone = () => /iPhone|iPod/i.test(navigator.userAgent);

  startButton.addEventListener('click', async () => {
    if (!isTouchDevice()) return;

    // iPhone Safari has its own dynamic visual viewport. Forcing element fullscreen
    // can cause a second resize while the game starts, so iPhone stays in exact FIT mode.
    if (!isIPhone()) {
      try {
        if (!document.fullscreenElement && frame.requestFullscreen) {
          await frame.requestFullscreen({ navigationUI: 'hide' });
        }
      } catch (_) {
        // Normal Phaser FIT mode remains the fallback.
      }
    }

    try {
      if (screen.orientation?.lock) await screen.orientation.lock('landscape');
    } catch (_) {
      // Orientation locking is optional and browser-dependent.
    }
  });
})();
