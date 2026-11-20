import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, Newspaper, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthGate, EmptyState, PageHeader } from '../components/ui';
import { formatDateShort } from '../lib/formatters';

export const ResourcesPage: React.FC<{ forcedCategory?: 'Articles' | 'News' }> = ({
  forcedCategory,
}) => {
  const { articles } = useApp();
  const [tab, setTab] = useState<'All' | 'Articles' | 'News'>(forcedCategory || 'All');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const activeCategory = forcedCategory || tab;

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (activeCategory !== 'All' && a.category !== activeCategory) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [articles, activeCategory, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: forcedCategory === 'News' ? 'News' : 'Articles & news' },
        ]}
        eyebrow={forcedCategory === 'News' ? 'News' : 'Resources'}
        title={forcedCategory === 'News' ? 'Latest news' : 'Articles & news'}
        intro="Practice checklists, career advice for pharmacists, and announcements from the Doctor of Pharmacy Association Pakistan."
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {!forcedCategory && (
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface2)] border border-[var(--line)]">
                {(['All', 'Articles', 'News'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTab(item);
                      setPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                      tab === item
                        ? 'bg-[var(--fg)] text-[var(--bg)]'
                        : 'text-[var(--fg)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              <label htmlFor="res-q" className="sr">
                Search articles
              </label>
              <input
                id="res-q"
                type="search"
                className="dopa-input sm:w-72"
                placeholder="Search articles & news..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {paginated.length === 0 ? (
            <EmptyState
              icon={<Newspaper className="w-6 h-6" />}
              title="No articles match your search"
              action={
                <button
                  type="button"
                  onClick={() => {
                    setTab('All');
                    setQuery('');
                  }}
                  className="dopa-btn sm primary"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.map((art) => (
                <article key={art.id} className="dopa-card hov flex flex-col gap-3 !p-4">
                  <Link to={`/${art.slug}/`} className="block overflow-hidden rounded-xl">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full aspect-[16/10] object-cover bg-[var(--surface2)]"
                    />
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span className="font-semibold text-[var(--accent)]">{art.category}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="num">{formatDateShort(art.publishedAt)}</span>
                    {art.membersOnly && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span className="inline-flex items-center gap-1 text-[var(--warn)] font-semibold">
                          <Lock className="w-3 h-3" /> Members only
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-bold leading-snug">
                    <Link to={`/${art.slug}/`} className="text-[var(--fg)] hover:text-[var(--accent)] no-underline">
                      {art.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-[var(--muted)] flex-1 line-clamp-3">{art.excerpt}</p>
                  <Link
                    to={`/${art.slug}/`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] no-underline hover:underline mt-1"
                  >
                    Read article <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`px-3.5 py-1.5 rounded-lg border text-sm font-semibold cursor-pointer ${
                    p === page
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const ArticleDetailPage: React.FC = () => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { articles, isActiveDopaMember, isAdmin, currentUser, pushToast } = useApp();

  const article = articles.find((a) => a.slug === articleSlug);

  if (!article) {
    return (
      <div className="py-14">
        <div className="wrap max-w-2xl">
          <EmptyState
            title="Page or article not found"
            description="The link you opened does not match any active page or article."
            action={
              <Link to="/resources/" className="dopa-btn sm primary">
                Browse articles &amp; news
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const canRead = !article.membersOnly || isActiveDopaMember || isAdmin;
  const related = articles.filter((a) => a.id !== article.id).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    pushToast('Article link copied to clipboard.', 'info');
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Articles & news', to: '/resources/' },
          { label: article.title },
        ]}
        eyebrow={`${article.category} · ${formatDateShort(article.publishedAt)} · ${article.author}`}
        title={article.title}
        actions={
          <button type="button" onClick={handleShare} className="dopa-btn sm ghost">
            <Share2 className="w-4 h-4" /> Share
          </button>
        }
      />

      <section className="pb-14">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <article className="lg:col-span-8 dopa-card flex flex-col gap-5">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full max-h-[380px] object-cover rounded-2xl bg-[var(--surface2)]"
            />

            {!canRead ? (
              <div className="py-6 flex flex-col gap-4">
                <div className="dopa-notice warn">
                  <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <b>DOPA members-only article.</b> Only active, admin-approved DOPA members can read this full clinical resource.
                  </div>
                </div>
                {!currentUser ? (
                  <AuthGate
                    title="DOPA members-only content"
                    message="Sign in with a DOPA member account or apply for DOPA Association membership to unlock this article."
                  />
                ) : (
                  <div className="dopa-card flat bg-[var(--surface2)] text-center py-6">
                    <h3 className="mb-2">Apply for DOPA Association Membership</h3>
                    <p className="text-sm text-[var(--muted)] mb-4">
                      Your website account does not yet have an active DOPA membership.
                    </p>
                    <Link to="/dopa-association/" className="dopa-btn primary">
                      Apply for DOPA membership
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-[1.03rem] leading-relaxed text-[var(--fg)]">
                {article.content.map((para, idx) => (
                  <p key={idx} className={idx === 0 ? 'text-lg text-[var(--muted)] font-medium' : ''}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-[var(--line)]">
              <Link
                to="/resources/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold no-underline"
              >
                <ArrowLeft className="w-4 h-4" /> All articles
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-4 flex flex-col gap-4">
            <div className="dopa-card flat">
              <h3 className="text-base font-bold mb-3">Related reading</h3>
              <div className="flex flex-col gap-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/${r.slug}/`}
                    className="pb-3 border-b border-dashed border-[var(--line)] last:border-b-0 last:pb-0 no-underline group"
                  >
                    <div className="text-xs text-[var(--muted)] num mb-1">
                      {r.category} &middot; {formatDateShort(r.publishedAt)}
                    </div>
                    <div className="text-sm font-semibold text-[var(--fg)] group-hover:text-[var(--accent)]">
                      {r.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
