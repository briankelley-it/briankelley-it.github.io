(function () {
  var el = document.querySelector('.typed');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var words = el.dataset.words.split('|');
  var w = 0, i = 0, deleting = false;
  el.classList.add('is-typing');
  el.textContent = '';
  function tick() {
    var word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);
    var delay = deleting ? 45 : 90;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 400);
})();
