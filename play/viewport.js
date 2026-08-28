(() => {
  const root = document.documentElement;

  const updateViewportHeight = () => {
    const height = Math.round(window.visualViewport?.height || window.innerHeight);
    root.style.setProperty('--game-vh', `${height}px`);
  };

  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(updateViewportHeight, 80), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportHeight, { passive: true });
    window.visualViewport.addEventListener('scroll', updateViewportHeight, { passive: true });
  }

  const lockGestures = () => {
    const frame = document.querySelector('.game-frame');
    if (!frame) return;

    ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
      frame.addEventListener(type, (event) => event.preventDefault(), { passive: false });
    });

    frame.addEventListener('touchmove', (event) => {
      if (event.touches.length > 1) event.preventDefault();
    }, { passive: false });

    frame.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });

    let lastTouchEnd = 0;
    frame.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 320) event.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lockGestures, { once: true });
  } else {
    lockGestures();
  }
})();
