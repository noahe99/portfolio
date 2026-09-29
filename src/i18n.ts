export const locales = ['de', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'de';

export const ui = {
  de: {
    tagline: 'Fullstack-Entwickler in Graz',
    description:
      'Portfolio von Noah Edelsbrunner, Fullstack-Entwickler in Graz: Websites, Shops und Web-Apps.',
    skip: 'Zum Inhalt springen',
    navLabel: 'Dateibaum',
    menu: 'Menü',
    close: 'Menü schließen',
    langLabel: 'Sprache',
    themeLabel: 'Farbschema wechseln',
    files: {
      readme: 'README.md',
      about: 'ueber-mich.md',
      contact: 'kontakt.md',
      imprint: 'impressum.md',
      privacy: 'datenschutz.md',
    },
    projectsDir: 'projekte/',
    liveDir: 'live-urls/',
    sideDir: 'side-projects/',
    liveTitle: 'Live-URLs',
    liveIntro: 'Echte Websites im Betrieb, gebaut für Arbeitgeber und Kunden.',
    sideTitle: 'Side-Projects',
    sideIntro: 'Eigene Projekte, an denen ich Neues ausprobiere.',
    hi: 'Hi, ich bin',
    intro:
      'Ich baue Websites, Shops und Web-Apps, von der Idee bis zum Betrieb. Aktuell suche ich eine Stelle als Fullstack-Entwickler in Graz.',
    stackTitle: 'Stack',
    stackHint: 'Tipp: Die Häkchen lassen sich umschalten.',
    stackEmpty: 'Nichts ausgewählt. Auch eine Haltung.',
    asciiOn: '◌ ascii: an',
    asciiOff: '◌ ascii: aus',
    splitLabel: 'Projekt-Vorschau',
    splitClose: 'Split schließen (Esc)',
    workTitle: 'Ausgewählte Projekte',
    allProjects: 'Alle Projekte',
    aboutTitle: 'Über mich',
    aboutText: [
      'Ich bin Fullstack-Entwickler und arbeite in Graz. Mein Schwerpunkt sind Websites und Shops, die schnell, wartbar und für Kunden gut bedienbar sind.',
      'Dieser Text ist ein Platzhalter. Hier kommen deine Geschichte, Arbeitsweise und Interessen hin.',
    ],
    projectsTitle: 'Projekte',
    projectsIntro: 'Eine Auswahl an Arbeiten mit Hintergrund, Entscheidungen und Ergebnis.',
    noProjects: 'Noch keine Projekte veröffentlicht.',
    role: 'Rolle',
    year: 'Jahr',
    stack: 'Stack',
    live: 'Live ansehen',
    repo: 'Quellcode',
    back: '← zurück zu den Projekten',
    contactTitle: 'Kontakt',
    contactText: 'Du hast ein Projekt oder eine offene Stelle? Schreib mir.',
    imprintTitle: 'Impressum',
    privacyTitle: 'Datenschutz',
    notFound: 'Seite nicht gefunden',
    notFoundText: 'E492: Not an editor command. Diese Seite gibt es nicht.',
    home: 'Zur Startseite',
  },
  en: {
    tagline: 'Full-stack developer in Graz',
    description:
      'Portfolio of Noah Edelsbrunner, full-stack developer in Graz: websites, shops and web apps.',
    skip: 'Skip to content',
    navLabel: 'File tree',
    menu: 'Menu',
    close: 'Close menu',
    langLabel: 'Language',
    themeLabel: 'Toggle color scheme',
    files: {
      readme: 'README.md',
      about: 'about.md',
      contact: 'contact.md',
      imprint: 'imprint.md',
      privacy: 'privacy.md',
    },
    projectsDir: 'projects/',
    liveDir: 'live-urls/',
    sideDir: 'side-projects/',
    liveTitle: 'Live-URLs',
    liveIntro: 'Real websites in production, built for an employer or clients.',
    sideTitle: 'Side-Projects',
    sideIntro: 'Projects of my own where I try out new things.',
    hi: "Hi, I'm",
    intro:
      'I build websites, shops and web apps, from idea to operation. Currently looking for a full-stack developer role in Graz.',
    stackTitle: 'Stack',
    stackHint: 'Tip: the checkboxes can be toggled.',
    stackEmpty: 'Nothing selected. Fair enough.',
    asciiOn: '◌ ascii: on',
    asciiOff: '◌ ascii: off',
    splitLabel: 'Project preview',
    splitClose: 'Close split (Esc)',
    workTitle: 'Selected work',
    allProjects: 'All projects',
    aboutTitle: 'About me',
    aboutText: [
      'I am a full-stack developer based in Graz. I focus on websites and shops that are fast, maintainable and easy for clients to use.',
      'This text is a placeholder. Your story, way of working and interests go here.',
    ],
    projectsTitle: 'Projects',
    projectsIntro: 'A selection of work, with background, decisions and outcome.',
    noProjects: 'No projects published yet.',
    role: 'Role',
    year: 'Year',
    stack: 'Stack',
    live: 'View live',
    repo: 'Source code',
    back: '← back to projects',
    contactTitle: 'Contact',
    contactText: 'Have a project or an open position? Get in touch.',
    imprintTitle: 'Legal notice',
    privacyTitle: 'Privacy',
    notFound: 'Page not found',
    notFoundText: 'E492: Not an editor command. This page does not exist.',
    home: 'Back to start',
  },
} as const;

export const otherLang = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');

/** URL for a page in a language; `path` without slashes, e.g. 'projects/foo'. */
export function href(lang: Lang, path = ''): string {
  const base = lang === defaultLang ? '/' : `/${lang}/`;
  return path ? `${base}${path}/` : base;
}

/** Same page in another language (slugs are identical across languages). */
export function switchPath(pathname: string, to: Lang): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  if (to === defaultLang) return stripped;
  return stripped === '/' ? '/en/' : `/en${stripped}`;
}

/** getStaticPaths helper for pages under src/pages/[...lang]/ */
export function localePaths() {
  return locales.map((lang) => ({
    params: { lang: lang === defaultLang ? undefined : lang },
    props: { lang },
  }));
}
