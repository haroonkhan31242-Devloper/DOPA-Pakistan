import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  GraduationCap,
  Heart,
  Newspaper,
  Pill,
  ShoppingBag,
  Users,
  Video,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateShort, formatPKR } from '../lib/formatters';

export const HomePage: React.FC = () => {
  const {
    slides,
    memberships,
    pharmacies,
    articles,
    universities,
    products,
    settings,
    addToCart,
  } = useApp();

  const [slideIdx, setSlideIdx] = useState(0);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const approvedMembersCount = memberships.filter((m) => m.status === 'Approved').length;
  const approvedPharmacies = pharmacies.filter((p) => p.status === 'Approved');
  const latestArticles = articles.filter((a) => a.category === 'Articles').slice(0, 3);
  const latestNews = articles.filter((a) => a.category === 'News').slice(0, 3);
  const featuredProducts = products.filter((p) => p.active).slice(0, 4);

  const featureItems = [
    {
      to: '/dopa-association/',
      label: 'DOPA Association',
      icon: (
        <img
          src="/assets/img/dopa-assoc-logo.png"
          alt=""
          className="w-9 h-9 rounded-full bg-white object-contain"
        />
      ),
    },
    { to: '/shop/', label: 'Products', icon: <ShoppingBag className="w-6 h-6" /> },
    { to: '/raw-materials/', label: 'Raw materials', icon: <FlaskConical className="w-6 h-6" /> },
    { to: '/life-partner/', label: 'Life partner', icon: <Heart className="w-6 h-6" /> },
    { to: '/jobs/', label: 'Jobs', icon: <Briefcase className="w-6 h-6" /> },
    { to: '/pharmacies/', label: 'Pharmacies', icon: <Building2 className="w-6 h-6" /> },
    { to: '/request-medicine/', label: 'Request a medicine', icon: <Pill className="w-6 h-6" /> },
    { to: '/videos/', label: 'Videos', icon: <Video className="w-6 h-6" /> },
    { to: '/community/', label: 'Community', icon: <Users className="w-6 h-6" /> },
    { to: '/universities/', label: 'Universities', icon: <GraduationCap className="w-6 h-6" /> },
  ];

  return (
    <div>
      {/* Section 1: Screen-reader H1 matching reference */}
      <h1 className="sr">Doctor of Pharmacy (Pharm.D), Doctor of Pharmacy Association Pakistan</h1>

      {/* Section 2: News Slider */}
      <section className="pt-8 pb-2" aria-roledescription="carousel" aria-label="Latest news and announcements">
        <div className="wrap">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <div className="eyebrow">Latest from DOPA</div>
              <h2 className="mt-1.5">News and announcements</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSlideIdx((i) => (i - 1 + slides.length) % slides.length)}
                aria-label="Previous slide"
                className="w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] grid place-items-center hover:border-[var(--accent)] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((i) => (i + 1) % slides.length)}
                aria-label="Next slide"
                className="w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] grid place-items-center hover:border-[var(--accent)] cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--navy)]">
            <ul
              className="flex m-0 p-0 list-none transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${slideIdx * 100}%)` }}
            >
              {slides.map((slide, idx) => (
                <li
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} of ${slides.length}`}
                  className="relative flex-[0_0_100%] min-w-0 aspect-[4/3.2] md:aspect-[16/7] flex items-end overflow-hidden text-[#E8F3F6]"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(0deg, rgba(8,26,43,0.92) 0%, rgba(8,26,43,0.5) 48%, rgba(8,26,43,0.08) 80%)',
                    }}
                  />
                  <div className="relative z-10 grid gap-2.5 justify-items-start p-5 md:p-10 max-w-2xl">
                    {slide.tag && (
                      <span className="font-mono-dopa text-xs tracking-widest uppercase text-[#83E5D2]">
                        {slide.tag}
                      </span>
                    )}
                    <h3 className="font-display text-2xl md:text-4xl font-bold leading-tight text-white">
                      {slide.title}
                    </h3>
                    <p className="text-sm md:text-base text-[#D6E6EE] leading-relaxed">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.link}
                      className="dopa-btn sm mt-1 bg-[#83E5D2] text-[#06222B] hover:bg-[#A3F0E0]"
                    >
                      {slide.ctaLabel} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Choose slide">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-label={`Slide ${idx + 1}`}
                aria-selected={idx === slideIdx}
                onClick={() => setSlideIdx(idx)}
                className={`h-2.5 rounded-full border-0 cursor-pointer transition-all ${
                  idx === slideIdx ? 'w-7 bg-[var(--accent)]' : 'w-2.5 bg-[var(--line)]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Strip (10 quick access tiles) */}
      <nav className="pt-6" aria-label="Features">
        <div className="wrap">
          <div className="feat-grid">
            {featureItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="feat-item flex flex-col items-center gap-2 text-center no-underline text-[var(--fg)] p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--accent)] transition-all"
              >
                <span className="w-12 h-12 rounded-2xl grid place-items-center bg-gradient-to-br from-[#087F8C]/15 to-[#12A889]/20 text-[var(--accent)]">
                  {item.icon}
                </span>
                <span className="text-[0.82rem] font-semibold leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Section 3–5: Row 1 (Membership, Pharmacies, Services) */}
      <section className="py-10 md:py-12">
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tile 1: Membership */}
            <article className="dopa-card hov tile-join flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15">
                <img
                  src="/assets/img/dopa-assoc-logo.png"
                  alt=""
                  className="w-8 h-8 rounded-full bg-white object-contain"
                />
              </div>
              <div className="eyebrow">Membership</div>
              <h3 className="text-xl font-bold text-[var(--accent)]">
                JOIN Doctor of Pharmacy Association (DOPA)
              </h3>
              <div className="flex-1 flex flex-col gap-2">
                <p className="flex items-baseline gap-2">
                  <b className="font-display font-extrabold text-3xl text-[var(--accent)] num">
                    {approvedMembersCount}
                  </b>
                  <span className="font-semibold text-sm">DOPA members</span>
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Become a member of the association. Apply once a year for DOPA membership: members-only content, a verified DOPA card and a voice for the profession.
                </p>
                <p className="text-sm font-bold text-[var(--accent)] mt-1">
                  {settings.dopaFee === 0 ? 'Free to join for now' : `${formatPKR(settings.dopaFee)} / 12 months`}
                </p>
              </div>
              <Link
                to="/dopa-association/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                Apply for membership <ArrowRight className="w-4 h-4" />
              </Link>
            </article>

            {/* Tile 2: Pharmacies */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="eyebrow">Pharmacies</div>
              <h3 className="text-lg font-bold">
                Our Registered Pharmacies, linked with Doctor of Pharmacy
              </h3>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted)]">
                  <b className="text-[var(--fg)] num">{approvedPharmacies.length}</b> verified pharmacies, checked by the admin.
                </p>
                <ul className="list-none p-0 mt-3 flex flex-col gap-2">
                  {approvedPharmacies.slice(0, 4).map((ph) => (
                    <li
                      key={ph.id}
                      className="flex items-center justify-between gap-2 pb-2 border-b border-dashed border-[var(--line)] last:border-b-0 last:pb-0 text-sm"
                    >
                      <Link
                        to={`/pharmacy/?shop=${encodeURIComponent(ph.slug)}`}
                        className="font-medium text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                      >
                        {ph.name}
                      </Link>
                      <span className="text-xs text-[var(--muted)]">{ph.city}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/pharmacies/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                View all pharmacies <ArrowRight className="w-4 h-4" />
              </Link>
            </article>

            {/* Tile 3: Services */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="eyebrow">What we do</div>
              <h3 className="text-lg font-bold">Our services &amp; struggle</h3>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted)]">
                  Jobs, community and a verified pharmacy network today. Recognition, clinical posts and a fair service structure for pharmacists tomorrow.
                </p>
              </div>
              <Link
                to="/services/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                Read more <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Section 6–8: Row 2 (Articles, Universities, Latest News) */}
      <section className="pb-10 md:pb-12">
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tile 4: Articles */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="eyebrow">Articles</div>
              <h3 className="text-lg font-bold">Reading for pharmacists</h3>
              <div className="flex-1">
                <ul className="list-none p-0 mt-1 flex flex-col gap-2.5">
                  {latestArticles.map((art) => (
                    <li
                      key={art.id}
                      className="flex items-start justify-between gap-2 pb-2 border-b border-dashed border-[var(--line)] last:border-b-0 last:pb-0 text-sm"
                    >
                      <Link
                        to={`/${art.slug}/`}
                        className="font-medium text-[var(--fg)] hover:text-[var(--accent)] no-underline leading-snug"
                      >
                        {art.title}
                      </Link>
                      <span className="text-xs text-[var(--muted)] whitespace-nowrap shrink-0 num">
                        {formatDateShort(art.publishedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/resources/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </article>

            {/* Tile 5: Universities */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="eyebrow">Universities</div>
              <h3 className="text-lg font-bold">Where to study Pharm.D</h3>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted)]">
                  <b className="text-[var(--fg)] num">{universities.length}</b> universities across Pakistan offering the five-year Doctor of Pharmacy programme.
                </p>
                <ul className="list-none p-0 mt-3 flex flex-col gap-2">
                  {universities.slice(0, 3).map((uni) => (
                    <li
                      key={uni.id}
                      className="flex items-start justify-between gap-2 pb-2 border-b border-dashed border-[var(--line)] last:border-b-0 last:pb-0 text-sm"
                    >
                      <span className="font-medium text-[var(--fg)] leading-snug">{uni.name}</span>
                      <span className="text-xs text-[var(--muted)] shrink-0">{uni.city}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/universities/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                See all universities <ArrowRight className="w-4 h-4" />
              </Link>
            </article>

            {/* Tile 6: Latest News */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <Newspaper className="w-5 h-5" />
              </div>
              <div className="eyebrow">Latest news</div>
              <h3 className="text-lg font-bold">News about Pharm.D and Pharmacy profession</h3>
              <div className="flex-1">
                {latestNews.length > 0 ? (
                  <ul className="list-none p-0 mt-1 flex flex-col gap-2.5">
                    {latestNews.map((n) => (
                      <li
                        key={n.id}
                        className="flex items-start justify-between gap-2 pb-2 border-b border-dashed border-[var(--line)] last:border-b-0 last:pb-0 text-sm"
                      >
                        <Link
                          to={`/${n.slug}/`}
                          className="font-medium text-[var(--fg)] hover:text-[var(--accent)] no-underline leading-snug"
                        >
                          {n.title}
                        </Link>
                        <span className="text-xs text-[var(--muted)] whitespace-nowrap shrink-0 num">
                          {formatDateShort(n.publishedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    Updates on pharmacy regulation, hospital cadres, and DOPA initiatives.
                  </p>
                )}
              </div>
              <Link
                to="/category/news/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                All news <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Section 9–11: Row 3 (Raw materials, Life partner, Request a medicine) */}
      <section className="pb-10 md:pb-12">
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tile 7: Raw Materials */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="eyebrow">Raw materials</div>
              <h3 className="text-lg font-bold">Buy &amp; sell pharmaceutical raw materials</h3>
              <div className="flex-1 flex flex-col gap-3">
                <p className="text-sm text-[var(--muted)]">
                  Buy and sell APIs, excipients, solvents and packaging from sellers approved by the admin. Anyone can apply to become a seller.
                </p>
                <div className="text-xs text-[var(--muted)]">
                  APIs &middot; Excipients &middot; Solvents &middot; Capsule shells &middot; Packaging
                </div>
                <div>
                  <Link to="/sell-raw-materials/?apply=1" className="dopa-btn sm ghost">
                    Become a seller
                  </Link>
                </div>
              </div>
              <Link
                to="/raw-materials/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                Browse raw materials <ArrowRight className="w-4 h-4" />
              </Link>
            </article>

            {/* Tile 8: Life Partner */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <Heart className="w-5 h-5" />
              </div>
              <div className="eyebrow">Find a life partner</div>
              <h3 className="text-lg font-bold">Find your life partner</h3>
              <div className="flex-1 flex flex-col gap-2">
                <p className="text-sm text-[var(--muted)]">
                  A private matrimonial service for our community. Every profile is checked by the admin, and phone numbers stay hidden until you accept a request.
                </p>
                <p className="text-sm font-bold text-[var(--accent)] mt-1">
                  {formatPKR(settings.lifePartnerFee)} for 12 months
                </p>
              </div>
              <Link
                to="/life-partner/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                Find a life partner <ArrowRight className="w-4 h-4" />
              </Link>
            </article>

            {/* Tile 9: Request a medicine */}
            <article className="dopa-card hov flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#087F8C]/15 text-[var(--accent)]">
                <Pill className="w-5 h-5" />
              </div>
              <div className="eyebrow">Request a medicine</div>
              <h3 className="text-lg font-bold">Can&apos;t find a medicine?</h3>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted)]">
                  Send one request to every registered pharmacy with your prescription. Pharmacies reply with availability and price.
                </p>
              </div>
              <Link
                to="/request-medicine/"
                className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--accent)] no-underline hover:underline mt-2"
              >
                Request a medicine <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Section 12: Products from registered pharmacies */}
      <section className="pb-12">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <div className="eyebrow">Products</div>
              <h2 className="mt-1.5">From our registered pharmacies</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/request-medicine/" className="dopa-btn ghost">
                Request a medicine
              </Link>
              <Link to="/shop/" className="dopa-btn ghost">
                View more products
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredProducts.map((prod) => {
              const ph = pharmacies.find((p) => p.id === prod.pharmacyId);
              const qty = qtyMap[prod.id] || 1;
              return (
                <article
                  key={prod.id}
                  className="dopa-card grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4 items-start"
                >
                  <Link to={`/product/${prod.slug}/`} className="block">
                    <img
                      src={prod.image || '/assets/uploads/prod-panadol.jpg'}
                      alt={prod.name}
                      className="w-full h-36 sm:h-40 object-cover rounded-xl bg-[var(--surface2)]"
                    />
                  </Link>
                  <div className="flex flex-col gap-2 min-w-0">
                    <Link
                      to={`/product/${prod.slug}/`}
                      className="font-bold text-base text-[var(--fg)] hover:text-[var(--accent)] no-underline leading-snug"
                    >
                      {prod.name}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      by{' '}
                      <Link
                        to={`/pharmacy/?shop=${encodeURIComponent(ph?.slug || '')}`}
                        className="font-medium hover:underline"
                      >
                        {ph?.name || 'Verified Pharmacy'}
                      </Link>
                      {ph ? `, ${ph.city}` : ''}
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-2">{prod.description}</p>
                    <div className="font-bold text-lg num text-[var(--fg)]">
                      {formatPKR(prod.price)}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <label htmlFor={`home-qty-${prod.id}`} className="sr">
                        Quantity
                      </label>
                      <input
                        id={`home-qty-${prod.id}`}
                        type="number"
                        min={1}
                        max={prod.stock}
                        value={qty}
                        onChange={(e) =>
                          setQtyMap((prev) => ({
                            ...prev,
                            [prod.id]: Math.max(1, Math.min(prod.stock, Number(e.target.value) || 1)),
                          }))
                        }
                        className="dopa-input !w-[72px] !min-h-[36px] !py-1.5 text-center num"
                      />
                      <button
                        type="button"
                        onClick={() => addToCart(prod.id, qty)}
                        className="dopa-btn sm primary"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 13: Final Join CTA */}
      <section className="pb-4">
        <div className="wrap">
          <div className="dopa-cta flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-white max-w-[22ch] relative z-10">
              Pharm.D graduate or student? Join the DOPA Association.
            </h2>
            <div className="flex flex-wrap gap-3 relative z-10">
              <Link
                to="/dopa-association/"
                className="dopa-btn bg-[#83E5D2] text-[#06222B] hover:bg-[#A3F0E0]"
              >
                Join DOPA
              </Link>
              <Link
                to="/register/"
                className="dopa-btn ghost text-[#E8F3F6] border-[#83E5D2]/40 hover:border-[#83E5D2]"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
