// Line numbers like a real editor: every visual line gets a number (wrapped lines count),
// and the blank line between two blocks is numbered too, as it would be in the .md file.
// CSS draws the numbers from the --nums / --lh custom properties set here
// (fallback without JS: one counter per block, see global.css).

const observers = new WeakMap<HTMLElement, ResizeObserver>();

function measure(el: HTMLElement) {
  const style = getComputedStyle(el);
  if (style.display === 'none') return null;
  const lh = parseFloat(style.lineHeight) || 24;
  // an image is one line in markdown, however tall it is drawn
  if (el.querySelector('img') && !el.textContent?.trim()) return { lines: 1, lh };
  const chrome =
    parseFloat(style.paddingTop) +
    parseFloat(style.paddingBottom) +
    parseFloat(style.borderTopWidth) +
    parseFloat(style.borderBottomWidth);
  const height = el.getBoundingClientRect().height - chrome;
  return { lines: Math.max(1, Math.round(height / lh)), lh };
}

export function renumber(prose: HTMLElement) {
  let n = 1;
  for (const el of Array.from(prose.children) as HTMLElement[]) {
    const info = measure(el);
    if (!info) {
      el.style.removeProperty('--nums');
      el.style.removeProperty('--lh');
      continue;
    }
    // block lines + the blank line after it
    const numbers = Array.from({ length: info.lines + 1 }, (_, i) => n + i);
    el.style.setProperty('--nums', `"${numbers.join('\\A ')}"`);
    el.style.setProperty('--lh', `${info.lh}px`);
    n += info.lines + 1;
  }
}

/** Keeps the numbers right when the size changes: resize, font load, intro, toggled content. */
export function trackLines(prose: HTMLElement) {
  if (observers.has(prose)) return;
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => renumber(prose));
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(prose);
  observers.set(prose, observer);
  renumber(prose);
  document.fonts?.ready.then(schedule);
}
