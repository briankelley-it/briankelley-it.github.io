/* Static LedgerAPI demo (built by tools/build_ledgerapi_demo.py). There is no server here:
   requests to /api/v1/ are answered from responses recorded from the real API at build time. */
(() => {
  const realFetch = window.fetch.bind(window);
  const data = Promise.all([
    realFetch('recordings.json').then(r => r.json()),
    realFetch('schema.json').then(r => r.json()),
  ]);
  const OPEN = ['/api/v1/health/', '/api/v1/auth/register/', '/api/v1/auth/token/', '/api/v1/auth/token/refresh/'];

  const reply = (status, body, note) => new Response(
    status === 204 || body == null ? null : JSON.stringify(body, null, 2),
    { status, headers: { 'Content-Type': 'application/json', 'X-Demo-Note': note } });

  // Installed before Swagger UI loads, so its "Try it out" requests come through here.
  window.fetch = async (input, init) => {
    const req = new Request(input, init);
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/v1/')) return realFetch(input, init);
    const [rec, spec] = await data;
    const method = req.method.toUpperCase();
    const template = Object.keys(spec.paths).find(p =>
      new RegExp('^' + p.replace(/\{[^}]+\}/g, '[^/]+') + '$').test(url.pathname));
    if (!template) return reply(404, { detail: 'Not found.' }, 'Static demo');
    if (!OPEN.includes(template) && !req.headers.get('Authorization')) {
      return reply(rec.unauthorized.status, rec.unauthorized.body, 'Recorded response. Click Authorize first.');
    }
    const key = `${method} ${url.pathname}`;
    let hit = rec.responses[key + url.search];
    let note = 'Recorded response from the real API';
    if (!hit && rec.responses[key]) {
      hit = rec.responses[key];
      if (url.search) note += '. Query parameters are not applied in the static demo';
    }
    if (!hit) {
      const re = new RegExp('^' + template.replace(/\{[^}]+\}/g, '[^/]+') + '$');
      const similar = Object.keys(rec.responses).find(k => {
        const [m, p] = k.split(' ');
        return m === method && re.test(p.split('?')[0]);
      });
      if (!similar) return reply(501, { detail: 'This request was not recorded for the static demo.' }, 'Static demo');
      hit = rec.responses[similar];
      note = `Recorded response for ${similar} (the static demo has no live data)`;
    }
    if (method !== 'GET') note += '. Nothing was saved';
    return reply(hit.status, hit.body, note);
  };

  window.addEventListener('load', async () => {
    const [rec, spec] = await data;
    document.getElementById('demo-email').textContent = rec.credentials.email;
    document.getElementById('demo-password').textContent = rec.credentials.password;
    const scheme = Object.keys(spec.components?.securitySchemes || {})[0];
    const ui = SwaggerUIBundle({
      url: 'schema.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      persistAuthorization: false,
      displayRequestDuration: false,
      onComplete: () => { if (scheme) ui.preauthorizeApiKey(scheme, rec.access); },
    });
  });
})();
