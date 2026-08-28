document.querySelectorAll('[data-message]').forEach((element) => {
  element.addEventListener('click', () => {
    window.alert(element.dataset.message);
  });
});
