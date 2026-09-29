// Subtle animated ASCII "meadow" behind the home page.
// Low contrast, ~10 fps, paused in background tabs, off on small screens,
// static for prefers-reduced-motion, and switchable (choice kept in localStorage).

const KEY = 'ascii-bg';
const CHARS = ' .,:;+*#';
const FRAME_MS = 100;

export function initAscii() {
  const host = document.querySelector<HTMLElement>('[data-ascii]');
  const pre = host?.querySelector('pre');
  const toggle = document.querySelector<HTMLButtonElement>('[data-ascii-toggle]');
  if (!host || !pre) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 48rem)');

  const read = () => {
    try {
      return localStorage.getItem(KEY) !== 'off';
    } catch {
      return true;
    }
  };
  const write = (on: boolean) => {
    try {
      if (on) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, 'off');
    } catch {}
  };

  let enabled = read();
  let raf = 0;
  let last = 0;
  let cols = 0;
  let rows = 0;

  const layout = () => {
    const probe = document.createElement('span');
    probe.textContent = 'M'.repeat(20);
    probe.style.visibility = 'hidden';
    pre.append(probe);
    const charW = probe.getBoundingClientRect().width / 20;
    const lineH = parseFloat(getComputedStyle(pre).lineHeight) || 13;
    probe.remove();
    const box = host.getBoundingClientRect();
    cols = Math.max(1, Math.ceil(box.width / charW));
    rows = Math.max(1, Math.ceil(box.height / lineH));
  };

  // wind moving through grass: two interfering waves, denser toward the bottom
  const draw = (s: number) => {
    let out = '';
    for (let y = 0; y < rows; y++) {
      const depth = 0.25 + (y / rows) * 0.9;
      for (let x = 0; x < cols; x++) {
        const w = Math.sin(x * 0.08 + s * 0.7 + Math.sin(y * 0.13 + s * 0.4) * 1.8) + Math.sin(y * 0.2 - s * 0.5 + x * 0.04);
        const v = ((w + 2) / 4) * depth;
        out += CHARS[Math.min(CHARS.length - 1, Math.floor(v * CHARS.length))];
      }
      out += '\n';
    }
    pre.textContent = out;
  };

  const frame = (t: number) => {
    raf = requestAnimationFrame(frame);
    if (t - last < FRAME_MS) return;
    last = t;
    draw(t / 1000);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const sync = () => {
    stop();
    const active = enabled && wide.matches;
    host.toggleAttribute('data-on', active);
    if (!active) {
      pre.textContent = '';
    } else {
      layout();
      if (reduce.matches) draw(0);
      else raf = requestAnimationFrame(frame);
    }
    if (toggle) {
      toggle.hidden = !wide.matches;
      toggle.textContent = (enabled ? toggle.dataset.on : toggle.dataset.off) ?? '';
      toggle.setAttribute('aria-pressed', String(enabled));
    }
  };

  toggle?.addEventListener('click', () => {
    enabled = !enabled;
    write(enabled);
    sync();
  });
  wide.addEventListener('change', sync);
  reduce.addEventListener('change', sync);

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (enabled && wide.matches) {
        layout();
        if (reduce.matches) draw(0);
      }
    }, 150);
  }).observe(host);

  sync();
}
