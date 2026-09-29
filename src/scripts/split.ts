// :vsplit for projects. On wide screens, clicking a project link on an overview
// page (home, projects index) opens it in a pane to the right instead of navigating.
// Below the breakpoint, on project pages and without JS it is a normal link.

const WIDE = matchMedia('(min-width: 80rem)');
const PROJECT = /^(?:\/en)?\/projects\/[^/]+\/$/;

const shell = document.querySelector<HTMLElement>('.shell');
const statusFile = document.querySelector<HTMLElement>('.status-file');
const cache = new Map<string, { title: string; html: string }>();
const originalStatus = statusFile?.textContent ?? '';
let opener: HTMLElement | null = null;

const isOverview = !PROJECT.test(location.pathname);

async function load(path: string) {
  const hit = cache.get(path);
  if (hit) return hit;
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const prose = doc.querySelector('.prose');
    if (!prose) return null;
    const data = { title: doc.querySelector('h1')?.textContent ?? path, html: prose.innerHTML };
    cache.set(path, data);
    return data;
  } catch {
    return null;
  }
}

function pane() {
  let el = shell?.querySelector<HTMLElement>('.split');
  if (el) return el;
  el = document.createElement('section');
  el.className = 'split';
  el.setAttribute('aria-label', shell?.dataset.splitLabel ?? '');
  el.innerHTML = `
    <header class="split-head">
      <span class="split-title"></span>
      <button type="button" class="split-close"></button>
    </header>
    <div class="split-body" tabindex="-1"><div class="prose"></div></div>`;
  const close = el.querySelector<HTMLButtonElement>('.split-close')!;
  close.textContent = '×';
  close.setAttribute('aria-label', shell?.dataset.splitClose ?? 'Close');
  close.addEventListener('click', requestClose);
  shell?.append(el);
  return el;
}

async function open(path: string, push: boolean) {
  const data = await load(path);
  if (!data || !shell) {
    location.href = path;
    return;
  }
  const el = pane();
  el.querySelector('.prose')!.innerHTML = data.html;
  const file = `projects/${path.replace(/\/$/, '').split('/').pop()}.md`;
  el.querySelector('.split-title')!.textContent = file;
  el.querySelector<HTMLElement>('.split-body')!.scrollTop = 0;
  shell.dataset.split = 'open';
  if (statusFile) statusFile.textContent = `${originalStatus} │ ${file}`;
  if (push && location.pathname !== path) {
    // one split at a time: switching projects replaces the entry, so closing always ends on the overview
    if (history.state?.split) history.replaceState({ split: true }, '', path);
    else history.pushState({ split: true }, '', path);
  }
  el.querySelector<HTMLElement>('.split-body')!.focus({ preventScroll: true });
}

function closeUi() {
  shell?.querySelector('.split')?.remove();
  if (shell) delete shell.dataset.split;
  if (statusFile) statusFile.textContent = originalStatus;
  opener?.focus({ preventScroll: true });
  opener = null;
}

// the URL was pushed when opening, so closing goes one step back in history
function requestClose() {
  if (history.state?.split) history.back();
  else closeUi();
}

if (shell && isOverview) {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!WIDE.matches) return;
    const link = (e.target as Element).closest('a');
    if (!link || link.origin !== location.origin || !PROJECT.test(link.pathname)) return;
    e.preventDefault();
    opener = link;
    open(link.pathname, true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shell.dataset.split === 'open') requestClose();
  });

  addEventListener('popstate', () => {
    if (history.state?.split && PROJECT.test(location.pathname)) open(location.pathname, false);
    else closeUi();
  });
}
