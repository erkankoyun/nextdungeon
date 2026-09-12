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

const registerModal = document.getElementById('register-modal');
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');
const usernameInput = document.getElementById('register-username');
const emailInput = document.getElementById('register-email');
const passwordInput = document.getElementById('register-password');
const passwordConfirmInput = document.getElementById('register-password-confirm');
const welcomeToast = document.getElementById('welcome-toast');

let profile = null;

try {
  profile = JSON.parse(localStorage.getItem('nextdungeon_profile') || 'null');
} catch (_) {
  profile = null;
}

function setModalState(modal, isOpen) {
  if (!modal) return;
  modal.classList.toggle('open', isOpen);
  modal.setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('modal-open', isOpen);
}

function updateAccountButtons() {
  document.querySelectorAll('.account-cta').forEach((button) => {
    if (profile?.username) {
      button.textContent = `Welcome, ${profile.username}`;
      button.setAttribute('aria-label', `Account for ${profile.username}`);
    } else {
      button.textContent = 'Create Account';
      button.setAttribute('aria-label', 'Create account');
    }
  });
}

function openRegistration() {
  setModalState(registerModal, true);
  setTimeout(() => usernameInput?.focus(), 50);
}

document.querySelectorAll('[data-open-register]').forEach((button) => {
  button.addEventListener('click', openRegistration);
});

if (!profile) {
  window.addEventListener('load', () => {
    window.setTimeout(openRegistration, 250);
  });
} else {
  updateAccountButtons();
}

function showToast(message) {
  if (!welcomeToast) return;
  welcomeToast.textContent = message;
  welcomeToast.classList.add('show');
  window.setTimeout(() => welcomeToast.classList.remove('show'), 3500);
}

registerForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  registerError.textContent = '';

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmation = passwordConfirmInput.value;

  if (username.length < 3) {
    registerError.textContent = 'Username must be at least 3 characters.';
    usernameInput.focus();
    return;
  }

  if (!emailInput.validity.valid) {
    registerError.textContent = 'Enter a valid email address.';
    emailInput.focus();
    return;
  }

  if (password.length < 8) {
    registerError.textContent = 'Password must be at least 8 characters.';
    passwordInput.focus();
    return;
  }

  if (password !== confirmation) {
    registerError.textContent = 'Passwords do not match.';
    passwordConfirmInput.focus();
    return;
  }

  profile = {
    username,
    email,
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('nextdungeon_profile', JSON.stringify(profile));
  } catch (_) {
    // If storage is unavailable, keep the profile only for this page session.
  }

  passwordInput.value = '';
  passwordConfirmInput.value = '';
  updateAccountButtons();
  setModalState(registerModal, false);
  showToast(`Account preview created. Welcome to NextDungeon, ${username}.`);
});

const trailerModal = document.getElementById('trailer-modal');
const trailerKicker = document.getElementById('trailer-kicker');
const trailerHeadline = document.getElementById('trailer-headline');
const trailerSubline = document.getElementById('trailer-subline');
const trailerProgressBar = document.getElementById('trailer-progress-bar');
const trailerTime = document.getElementById('trailer-time');
const trailerReplay = document.getElementById('trailer-replay');

const trailerSlides = [
  { kicker: 'NEXTDUNGEON', headline: 'ENTER THE DUNGEON', subline: 'Every descent changes the fight.' },
  { kicker: 'CHOOSE YOUR CLASS', headline: 'ENGINEER · SOLDIER', subline: 'Build, breach, endure.' },
  { kicker: 'MOVE IN THE SHADOWS', headline: 'ROGUE · ARCHER', subline: 'Speed, precision, survival.' },
  { kicker: 'COMMAND THE ARCANE', headline: 'MAGE', subline: 'Power has a price.' },
  { kicker: 'EXPLORE · FIGHT · LOOT', headline: 'SURVIVE WHAT WAITS BELOW', subline: 'Your next dungeon is waiting.' }
];

let trailerTimer = null;
let trailerStartedAt = 0;
const trailerDuration = 15000;

function renderTrailerFrame(index) {
  const slide = trailerSlides[index] || trailerSlides[0];
  trailerKicker.textContent = slide.kicker;
  trailerHeadline.textContent = slide.headline;
  trailerSubline.textContent = slide.subline;
  const frame = document.getElementById('trailer-frame');
  frame.classList.remove('pulse');
  void frame.offsetWidth;
  frame.classList.add('pulse');
}

function stopTrailer() {
  if (trailerTimer) {
    window.clearInterval(trailerTimer);
    trailerTimer = null;
  }
}

function startTrailer() {
  stopTrailer();
  trailerStartedAt = Date.now();
  renderTrailerFrame(0);
  trailerProgressBar.style.width = '0%';
  trailerTime.textContent = '0:00 / 0:15';

  trailerTimer = window.setInterval(() => {
    const elapsed = Math.min(Date.now() - trailerStartedAt, trailerDuration);
    const progress = elapsed / trailerDuration;
    const frameIndex = Math.min(trailerSlides.length - 1, Math.floor(progress * trailerSlides.length));

    renderTrailerFrame(frameIndex);
    trailerProgressBar.style.width = `${progress * 100}%`;

    const seconds = Math.floor(elapsed / 1000);
    trailerTime.textContent = `0:${String(seconds).padStart(2, '0')} / 0:15`;

    if (elapsed >= trailerDuration) {
      stopTrailer();
      trailerTime.textContent = '0:15 / 0:15';
    }
  }, 500);
}

function openTrailer() {
  setModalState(trailerModal, true);
  startTrailer();
}

function closeTrailer() {
  stopTrailer();
  setModalState(trailerModal, false);
}

document.querySelectorAll('[data-open-trailer]').forEach((button) => {
  button.addEventListener('click', openTrailer);
});

document.querySelectorAll('[data-close-trailer]').forEach((button) => {
  button.addEventListener('click', closeTrailer);
});

trailerReplay?.addEventListener('click', startTrailer);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (trailerModal?.classList.contains('open')) {
    closeTrailer();
  }
});
