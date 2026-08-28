(() => {
  const root = document.documentElement;
  let rafId = 0;

  const updateViewport = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const vv = window.visualViewport;
      const width = Math.max(1, Math.round(vv?.width || window.innerWidth));
      const height = Math.max(1, Math.round(vv?.height || window.innerHeight));
      const left = Math.round(vv?.offsetLeft || 0);
      const top = Math.round(vv?.offsetTop || 0);

      const targetAspect = 16 / 9;
      let stageWidth = width;
      let stageHeight = width / targetAspect;

      if (stageHeight > height) {
        stageHeight = height;
        stageWidth = height * targetAspect;
      }

      root.style.setProperty('--game-vw', `${width}px`);
      root.style.setProperty('--game-vh', `${height}px`);
      root.style.setProperty('--game-left', `${left}px`);
      root.style.setProperty('--game-top', `${top}px`);
      root.style.setProperty('--stage-w', `${Math.floor(stageWidth)}px`);
      root.style.setProperty('--stage-h', `${Math.floor(stageHeight)}px`);

      // Phaser FIT reads the parent bounds. Refresh after Safari changes its visual viewport.
      requestAnimationFrame(() => {
        const scale = window.NEXTDUNGEON_GAME?.scale;
        if (scale && typeof scale.refresh === 'function') scale.refresh();
      });
    });
  };

  updateViewport();
  window.addEventListener('resize', updateViewport, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(updateViewport, 120), { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewport, { passive: true });
    window.visualViewport.addEventListener('scroll', updateViewport, { passive: true });
  }

  const lockGestures = () => {
    const frame = document.querySelector('.game-frame');
    if (!frame) return;

    ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
      frame.addEventListener(type, (event) => event.preventDefault(), { passive: false });
    });

    frame.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) event.preventDefault();
    }, { passive: false });

    frame.addEventListener('touchmove', (event) => {
      event.preventDefault();
    }, { passive: false });

    frame.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });

    let lastTouchEnd = 0;
    frame.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 350) event.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lockGestures, { once: true });
  } else {
    lockGestures();
  }
})();
