// Point every Download button straight at the newest installer, and show its version.
// Without JavaScript (or if GitHub can't be reached) the buttons still open the
// latest release page, so nothing breaks.
(async () => {
  try {
    const res = await fetch('https://api.github.com/repos/SujithShalitha/s-converter-releases/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return;
    const release = await res.json();
    const exe = (release.assets || []).find((a) => /\.exe$/i.test(a.name));
    if (!exe) return;
    for (const link of document.querySelectorAll('.js-download')) link.href = exe.browser_download_url;
    const version = String(release.tag_name || '').replace(/^v/, '');
    const size = Math.round(exe.size / 1024 / 1024);
    // data-tpl holds the sentence in the page's language: {0} version, {1} size
    for (const note of document.querySelectorAll('.js-version')) {
      note.textContent = (note.dataset.tpl || 'Version {0} · Free · No ads · No account · {1} MB').replace('{0}', version).replace('{1}', size);
    }
  } catch (e) {}
})();

// Respect "reduce motion": don't autoplay the demo video
try {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
  }
} catch (e) {}

// YouTube videos load only when someone presses play (no tracking before that)
document.querySelectorAll('.yt[data-yt]').forEach((box) => {
  box.querySelector('.yt-play')?.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.yt)}?autoplay=1&rel=0`;
    frame.title = box.querySelector('.yt-play').getAttribute('aria-label').replace(/^[^:：]*[:：]\s*/, '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    box.replaceChildren(frame);
  });
});

// On an English page, offer the same page in the reader's own language, once.
// Never a redirect: search engines and people who chose English stay put.
try {
  const OFFER = {
    es: 'Leer esta página en español', fr: 'Lire cette page en français', de: 'Diese Seite auf Deutsch lesen',
    it: 'Leggi questa pagina in italiano', ru: 'Читать эту страницу на русском', 'zh-Hans': '用简体中文阅读本页',
    ja: 'このページを日本語で読む', hi: 'यह पेज हिन्दी में पढ़ें', si: 'මෙම පිටුව සිංහලෙන් කියවන්න'
  };
  const alternates = new Map([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.hreflang, l.href]));
  // Only when the reader's first language isn't English
  const wanted = String((navigator.languages || [])[0] || navigator.language || '').toLowerCase();
  const code = wanted && Object.keys(OFFER).find((c) => c.toLowerCase() === wanted || (wanted.startsWith('zh') ? c === 'zh-Hans' && !/tw|hk|hant/.test(wanted) : wanted.split('-')[0] === c));
  if (document.documentElement.lang === 'en' && code && alternates.has(code) && localStorage.getItem('lang-offer') !== 'no') {
    const bar = document.createElement('div');
    bar.className = 'lang-offer';
    bar.lang = code;
    bar.innerHTML = '<a></a><button type="button" aria-label="Close">×</button>';
    bar.querySelector('a').href = new URL(alternates.get(code)).pathname + location.hash;
    bar.querySelector('a').textContent = OFFER[code] + ' →';
    bar.querySelector('button').addEventListener('click', () => { bar.remove(); try { localStorage.setItem('lang-offer', 'no'); } catch (e) {} });
    document.body.prepend(bar);
  }
} catch (e) {}

// Footer language menu: close on a click elsewhere or Escape
document.addEventListener('click', (e) => {
  document.querySelectorAll('.lang-menu[open]').forEach(m => { if (!m.contains(e.target)) m.open = false; });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.lang-menu[open]').forEach(m => { m.open = false; m.querySelector('summary').focus(); });
});
