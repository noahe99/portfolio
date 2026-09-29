// First-visit boot log: a short, real "build" printout on top of the page.
// The page underneath is normal HTML the whole time. Skippable with any input.
// Placeholders (__BUILD_*__) are replaced after the production build; in dev they stay.

interface Hooks {
  /** boot finished normally: continue with the intro animation */
  startIntro: () => void;
  /** boot was skipped: show the final page right away */
  skipIntro: () => void;
}

const real = (value: string | undefined) => (value && !value.startsWith('__') ? value : '');

export function runBoot(overlay: HTMLElement, { startIntro, skipIntro }: Hooks) {
  const root = document.documentElement;
  const out = overlay.querySelector<HTMLElement>('[data-boot-out]')!;
  const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
  const timers: number[] = [];

  const pages = real(overlay.dataset.pages);
  const buildMs = Number(real(overlay.dataset.ms));
  const commit = real(overlay.dataset.commit);
  const langs = (overlay.dataset.langs ?? '').split(',').filter(Boolean);
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const readyMs = Math.max(1, Math.round(nav?.domContentLoadedEventEnd || performance.now()));

  const lines = ['$ npm run build'];
  lines.push(
    pages && buildMs
      ? `  ✓ ${pages} pages built in ${(buildMs / 1000).toFixed(1)}s`
      : '  ✓ dev server, no production build',
  );
  lines.push(`  ✓ ${langs.length} languages (${langs.join(', ')})`);
  lines.push('  ✓ 0 cookies, 0 trackers');
  if (commit) lines.push(`  ✓ commit ${commit}`);
  lines.push('$ astro preview', `  ready in ${readyMs} ms`);

  const add = (line: string) => {
    const row = document.createElement('div');
    if (line.startsWith('  ✓')) {
      const mark = document.createElement('span');
      mark.className = 'boot-ok';
      mark.textContent = '✓';
      row.append(mark, line.slice(3));
    } else {
      row.textContent = line;
      if (line.startsWith('  ready')) row.className = 'boot-ready';
    }
    out.append(row);
  };

  const dismiss = () => {
    delete root.dataset.boot;
    overlay.classList.remove('boot-out');
  };

  const stopListening = () => {
    timers.forEach(clearTimeout);
    events.forEach((e) => removeEventListener(e, skip));
  };

  function skip() {
    stopListening();
    dismiss();
    skipIntro();
  }

  const finish = () => {
    stopListening();
    overlay.classList.add('boot-out'); // fade out while the intro already starts underneath
    startIntro();
    timers.push(window.setTimeout(dismiss, 400));
  };

  try {
    sessionStorage.setItem('boot-seen', '1');
  } catch {}

  events.forEach((e) => addEventListener(e, skip, { passive: true }));

  let at = 0;
  lines.forEach((line, i) => {
    at += i === 0 ? 0 : line.startsWith('$') ? 180 : line.startsWith('  ready') ? 300 : 110;
    timers.push(window.setTimeout(() => add(line), at));
  });
  timers.push(window.setTimeout(finish, at + 350));
}
