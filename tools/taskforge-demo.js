/* Static TaskForge demo (built by tools/build_taskforge_demo.py). There is no server here:
   HTMX GET requests load pre-rendered fragments, and anything that would change data shows a notice. */
(() => {
  const base = document.currentScript.src.replace(/static\/demo\/taskforge-demo\.js.*$/, '');
  const portfolio = new URL('../', base).href;

  const banner = document.createElement('div');
  banner.setAttribute('role', 'note');
  banner.style.cssText = 'background:#fef3c7;color:#422006;font:14px/1.4 system-ui,sans-serif;text-align:center;padding:8px 16px';
  banner.innerHTML = '<strong>Static demo.</strong> A snapshot of TaskForge with sample data. Browsing works, but changes are not saved. '
    + `<a href="${portfolio}" style="color:inherit;text-decoration:underline">Back to portfolio</a>`;
  document.body.prepend(banner);

  let toastTimer;
  const toast = () => {
    let t = document.getElementById('demo-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'demo-toast';
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;max-width:90vw;'
        + 'background:#111827;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:10px 16px;border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.25)';
      document.body.append(t);
    }
    t.textContent = 'This is a static demo, so changes are not saved. Run TaskForge locally to try everything.';
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  };

  // HTMX GETs read the fragment saved next to the page; everything else is blocked.
  document.addEventListener('htmx:configRequest', e => {
    const d = e.detail;
    if (d.verb !== 'get') return;
    const url = new URL(d.path, location.href);
    if (!url.pathname.endsWith('/')) return;
    d.path = url.pathname + '__hx/';
    for (const k of Object.keys(d.parameters || {})) delete d.parameters[k];
    if (d.formData) for (const k of [...d.formData.keys()]) d.formData.delete(k);
  });
  document.addEventListener('htmx:beforeRequest', e => {
    if (e.detail.requestConfig?.verb !== 'get') { e.preventDefault(); toast(); }
  });
  // A fragment that was not part of the snapshot: leave the page as it is.
  document.addEventListener('htmx:responseError', e => { e.detail.shouldSwap = false; toast(); });

  // Plain forms: the demo login goes straight to the dashboard; other posts show the notice.
  document.addEventListener('submit', e => {
    const form = e.target;
    if (form.method !== 'post') return;
    e.preventDefault();
    e.stopPropagation();
    if (/accounts\/demo\/?$/.test(new URL(form.action, location.href).pathname)) {
      location.href = base + 'projects/';
    } else {
      toast();
    }
  }, true);
})();
