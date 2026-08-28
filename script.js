const lockedDesign = document.getElementById('locked-design');

if (lockedDesign && Array.isArray(window.NEXTDUNGEON_IMAGE_PARTS)) {
  lockedDesign.src = `data:image/avif;base64,${window.NEXTDUNGEON_IMAGE_PARTS.join('')}`;
}

document.querySelectorAll('[data-message]').forEach((element) => {
  element.addEventListener('click', () => {
    window.alert(element.dataset.message);
  });
});
