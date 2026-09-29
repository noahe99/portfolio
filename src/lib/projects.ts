import { getCollection } from 'astro:content';
import type { Lang } from '../i18n';

/** Projects of one language, sorted by `order`. Drafts only show up in dev. */
export async function getProjects(lang: Lang) {
  const entries = await getCollection(
    'projects',
    ({ id, data }) => id.startsWith(`${lang}/`) && (import.meta.env.DEV || !data.draft),
  );
  return entries
    .map((entry) => ({ entry, slug: entry.id.slice(lang.length + 1) }))
    .sort((a, b) => a.entry.data.order - b.entry.data.order);
}
