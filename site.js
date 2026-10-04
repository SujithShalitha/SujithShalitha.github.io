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
    for (const note of document.querySelectorAll('.js-version')) {
      note.textContent = `Version ${version} · Free · No ads · No account · ${size} MB`;
    }
  } catch (e) {}
})();
