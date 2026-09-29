// Workspace for wide screens (1800 px and up): README.md always stays open on the left, every other page
// opens in a split pane on the right (one page at a time). Below the breakpoint, without JS
// and for the 404 page every link is a normal link.
//
// A deep link (e.g. /about/ from a search engine) is rearranged on load: README.md is fetched
// into the left pane and the requested page moves into the split. The head script hides the
// shell until that is done (html[data-ws="pending"]) so nothing jumps.

import { switchPath } from '../i18n';
import { renumber, trackLines } from './lines';

interface Page {
  title: string;
  html: string;
  file: string;
}

// split only where the README leaves the right half empty anyway (maximised Full HD and up)
const WIDE = matchMedia('(min-width: 112.5rem)');
const shell = document.querySelector<HTMLElement>('.shell');
const readme = document.querySelector<HTMLElement>('.buffer .prose');
const statusFile = document.querySelector<HTMLElement>('.status-file');

const meta = (name: string) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? '';
const norm = (path: string) => (path.endsWith('/') ? path : `${path}/`);
const pageKey = meta('x-page');
const homePath = /^\/en(\/|$)/.test(location.pathname) ? '/en/' : '/';
const isHome = (path: string) => norm(path) === homePath;

const cache = new Map<string, Page>();
let readmeFile = statusFile?.textContent ?? '';
let readmeTitle = document.title;
let opener: HTMLElement | null = null;

const active = () => !!shell && !!readme && WIDE.matches && pageKey !== '404';
const splitOpen = () => shell?.dataset.split === 'open';
const reveal = () => delete document.documentElement.dataset.ws;

async function load(path: string): Promise<Page | null> {
  const key = norm(path);
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const res = await fetch(key);
    if (!res.ok) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const prose = doc.querySelector('.buffer .prose');
    if (!prose) return null;
    const page = {
      title: doc.title,
      html: prose.innerHTML,
      file: doc.querySelector('meta[name="x-file"]')?.getAttribute('content') ?? '',
    };
    cache.set(key, page);
    return page;
  } catch {
    return null;
  }
}

function pane() {
  let el = shell!.querySelector<HTMLElement>('.split');
  if (el) return el;
  el = document.createElement('section');
  el.className = 'split';
  el.setAttribute('aria-label', shell!.dataset.splitLabel ?? '');
  el.innerHTML = `
    <header class="split-head">
      <span class="split-title"></span>
      <button type="button" class="split-close">×</button>
    </header>
    <div class="split-body" tabindex="-1"><div class="prose"></div></div>`;
  const close = el.querySelector<HTMLButtonElement>('.split-close')!;
  close.setAttribute('aria-label', shell!.dataset.splitClose ?? 'Close');
  close.addEventListener('click', requestClose);
  shell!.append(el);
  trackLines(el.querySelector<HTMLElement>('.prose')!);
  return el;
}

/** Title, status line, file tree highlight and language links follow what is open. */
function sync(page: (Page & { path: string }) | null) {
  document.title = page ? page.title : readmeTitle;
  if (statusFile) statusFile.textContent = page ? `${readmeFile} │ ${page.file}` : readmeFile;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.tree a[href]')) {
    if (link.origin !== location.origin) continue;
    const path = norm(link.pathname);
    const current = page ? path === page.path : path === homePath;
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.toggleAttribute('data-open', !!page && path === homePath);
  }
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.status-lang a')) {
    link.href = switchPath(location.pathname, link.lang as 'de' | 'en');
  }
}

async function openPage(path: string, mode: 'push' | 'replace' | 'none', focus = true) {
  const key = norm(path);
  const page = await load(key);
  if (!page || !shell) {
    location.href = key;
    return;
  }
  const el = pane();
  const prose = el.querySelector<HTMLElement>('.prose')!;
  const body = el.querySelector<HTMLElement>('.split-body')!;
  prose.innerHTML = page.html;
  renumber(prose);
  el.querySelector('.split-title')!.textContent = page.file;
  body.scrollTop = 0;
  shell.dataset.split = 'open';
  if (mode !== 'none' && norm(location.pathname) !== key) {
    // 'stack': there is a home entry behind this one, so closing can simply go back
    if (mode === 'push') history.pushState({ ws: 'stack' }, '', key);
    else history.replaceState({ ws: history.state?.ws ?? 'deep' }, '', key);
  }
  sync({ ...page, path: key });
  if (focus) body.focus({ preventScroll: true });
}

function closePage(mode: 'push' | 'none') {
  shell?.querySelector('.split')?.remove();
  if (shell) delete shell.dataset.split;
  if (mode === 'push' && !isHome(location.pathname)) history.pushState({ ws: 'home' }, '', homePath);
  sync(null);
  opener?.focus({ preventScroll: true });
  opener = null;
}

function requestClose() {
  if (history.state?.ws === 'stack') history.back();
  else closePage('push');
}

async function restructure() {
  const home = await load(homePath);
  if (!home || !readme) return reveal();
  const own: Page = { title: document.title, html: readme.innerHTML, file: meta('x-file') };
  cache.set(norm(location.pathname), own);
  readmeFile = home.file;
  readmeTitle = home.title;
  readme.innerHTML = home.html;
  renumber(readme);
  await openPage(location.pathname, 'replace', false);
  reveal();
}

function init() {
  if (!shell || !readme) return reveal();

  document.addEventListener('click', (e) => {
    if (!active() || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element).closest('a');
    if (!link || link.origin !== location.origin || link.target || link.hasAttribute('download')) return;
    if (link.hasAttribute('hreflang')) return; // language switch: a normal page load
    if (link.hash && norm(link.pathname) === norm(location.pathname)) return;
    if (/\.[a-z0-9]+$/i.test(link.pathname)) return; // files

    const path = norm(link.pathname);
    e.preventDefault();
    opener = link;
    if (isHome(path)) {
      if (splitOpen()) requestClose();
      return;
    }
    if (splitOpen() && path === norm(location.pathname)) return;
    openPage(path, splitOpen() ? 'replace' : 'push');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && splitOpen()) requestClose();
  });

  addEventListener('popstate', () => {
    if (!active()) return;
    if (isHome(location.pathname)) closePage('none');
    else openPage(location.pathname, 'none', false);
  });

  // crossing the breakpoint: reload, so the server page and the workspace never disagree
  WIDE.addEventListener('change', () => {
    if (pageKey === '404') return;
    if (!isHome(location.pathname) || splitOpen()) location.reload();
  });

  if (active() && pageKey && pageKey !== 'readme') restructure();
  else reveal();
}

init();
