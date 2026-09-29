import { getCollection } from 'astro:content';
import type { Lang } from '../i18n';

/** Projects of one language: live-urls first, then by `order`. Drafts only show up in dev. */
export async function getProjects(lang: Lang) {
  const entries = await getCollection(
    'projects',
    ({ id, data }) => id.startsWith(`${lang}/`) && (import.meta.env.DEV || !data.draft),
  );
  return entries
    .map((entry) => ({ entry, slug: entry.id.slice(lang.length + 1) }))
    .sort((a, b) => {
      const rank = (c: string) => (c === 'live' ? 0 : 1);
      return rank(a.entry.data.category) - rank(b.entry.data.category) || a.entry.data.order - b.entry.data.order;
    });
}
