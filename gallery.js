document.querySelectorAll('.gallery').forEach(function (gallery) {
  var main = gallery.querySelector('.gallery-main');
  var thumbs = gallery.querySelectorAll('.thumb');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      thumbs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-pressed', 'false');
      });
      thumb.classList.add('is-active');
      thumb.setAttribute('aria-pressed', 'true');
      main.classList.add('is-swapping');
      setTimeout(function () {
        main.src = thumb.dataset.src;
        main.alt = thumb.dataset.alt;
        main.classList.remove('is-swapping');
      }, 150);
    });
  });
});
