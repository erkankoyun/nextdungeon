const imageParts = window.NEXTDUNGEON_IMAGE_PARTS;

if (Array.isArray(imageParts)) {
  const approvedArtwork = `data:image/avif;base64,${imageParts.join('')}`;
  document.querySelectorAll('.source-art').forEach((image) => {
    image.src = approvedArtwork;
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });
}

// The homepage stays responsive while the game runs on its own fixed 16:9 viewport.
document.querySelectorAll('a[href="#demo"]').forEach((link) => {
  link.setAttribute('href', 'play/');
});

document.querySelectorAll('.demo-button, .preview-play').forEach((button) => {
  button.removeAttribute('data-message');
  button.addEventListener('click', () => {
    window.location.href = 'play/';
  });
});

document.querySelectorAll('[data-message]').forEach((element) => {
  element.addEventListener('click', () => {
    window.alert(element.dataset.message);
  });
});
