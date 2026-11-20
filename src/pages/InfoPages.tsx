import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Plus,
  Minus,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HoneypotField, PageHeader, EmptyState } from '../components/ui';
import { validateEmail } from '../lib/formatters';

/* ================= M4.1 ABOUT ================= */
export const AboutPage: React.FC = () => {
  const pillars = [
    {
      num: '01',
      title: 'Professional recognition',
      body: 'Advocating for fair recognition of pharmacists as qualified healthcare professionals and contributors to patient outcomes.',
      icon: <Award className="w-6 h-6" />,
    },
    {
      num: '02',
      title: 'Clinical pharmacy and prescribing',
      body: 'Promoting informed discussion, appropriate training, and evidence-based frameworks for expanded clinical pharmacy services.',
      icon: <Stethoscope className="w-6 h-6" />,
    },
    {
      num: '03',
      title: 'Quality pharmacy services',
      body: 'Supporting responsible practice standards that put medication safety, patient counselling, and public health first.',
      icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
      num: '04',
      title: 'Education and collaboration',
      body: 'Encouraging professional learning, peer collaboration, and constructive engagement with healthcare stakeholders.',
      icon: <HeartHandshake className="w-6 h-6" />,
    },
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="About"
        title="About Doctor of Pharmacy (Pharm.D)"
        intro="Doctor of Pharmacy Association Pakistan (DOPA) is committed to supporting pharmacists, advancing professional practice, and championing better medication care for communities across Pakistan."
      />

      <section className="pb-12">
        <div className="wrap">
          <div className="dopa-card max-w-4xl">
            <h2 className="mb-3">A stronger profession. A healthier Pakistan.</h2>
            <p className="text-[var(--muted)] leading-relaxed mb-3">
              Pharmacists are essential healthcare professionals. DOPA exists to help elevate their contribution, encourage evidence-based pharmacy practice, and promote constructive dialogue on the future of healthcare in Pakistan.
            </p>
            <p className="text-[var(--muted)] leading-relaxed">
              We aim to bring pharmacists together around shared goals: professional recognition, continuing development, responsible pharmacy services, and safe, effective use of medicines.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 bg-[var(--surface2)]">
        <div className="wrap">
          <div className="eyebrow">Focus Areas</div>
          <h2 className="mt-1.5 mb-6">Progress with purpose</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p) => (
              <article key={p.num} className="dopa-card hov flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#081A2B] to-[#102F4B] text-[#83E5D2] grid place-items-center">
                  {p.icon}
                </div>
                <div className="font-mono-dopa text-xs text-[var(--accent)]">{p.num}</div>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="text-sm text-[var(--muted)]">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-12">
        <div className="wrap">
          <div className="dopa-cta flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-white max-w-[24ch] relative z-10">
              Better pharmacy practice is an investment in better patient care.
            </h2>
            <div className="flex flex-wrap gap-3 relative z-10">
              <Link
                to="/dopa-association/"
                className="dopa-btn bg-[#83E5D2] text-[#06222B] hover:bg-[#A3F0E0]"
              >
                Join DOPA
              </Link>
              <Link
                to="/contact/"
                className="dopa-btn ghost text-[#E8F3F6] border-[#83E5D2]/40 hover:border-[#83E5D2]"
              >
                Work with DOPA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M4.2 OUR SERVICES & STRUGGLE ================= */
export const ServicesPage: React.FC = () => {
  const services = [
    {
      num: '01',
      title: 'Job board',
      text: 'Pharmacy jobs from hospitals, industry and pharmacies, checked by the admin before they go live.',
      to: '/jobs/',
    },
    {
      num: '02',
      title: 'Community and videos',
      text: 'A professional space to share cases, articles, questions and short videos with colleagues.',
      to: '/community/',
    },
    {
      num: '03',
      title: 'DOPA membership',
      text: 'A verified association membership with a member card and content shared only among members.',
      to: '/dopa-association/',
    },
    {
      num: '04',
      title: 'Pharmacy directory and shop',
      text: 'Licence-checked pharmacies listed in one place, with their products available to order and prescription medicine requests.',
      to: '/pharmacies/',
    },
    {
      num: '05',
      title: 'Raw materials & career guidance',
      text: 'B2B pharmaceutical raw materials marketplace plus curated articles and advice for students and new graduates.',
      to: '/raw-materials/',
    },
    {
      num: '06',
      title: 'Universities & life partner',
      text: 'Verified directory of Pharm.D institutions across Pakistan and a private matrimonial portal for the community.',
      to: '/universities/',
    },
  ];

  const strugglePoints = [
    'Recognition of Pharm.D graduates as qualified healthcare professionals.',
    'Clinical pharmacist posts in public and private hospitals.',
    'A fair service structure, career progression and pay for pharmacists.',
    'A qualified pharmacist present wherever medicines are sold, as the law intends.',
    'Continuing education and evidence-based pharmacy practice.',
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Our services & struggle' }]}
        eyebrow="What we do"
        title="Our Services & Struggle"
        intro="What DOPA does for pharmacists today, and what it is working to change for the profession."
      />

      <section className="pb-12">
        <div className="wrap">
          <h2 className="mb-6">Our services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <article key={s.num} className="dopa-card hov flex flex-col gap-2.5">
                <span className="font-mono-dopa text-xs text-[var(--accent)]">{s.num}</span>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-[var(--muted)] flex-1">{s.text}</p>
                <Link
                  to={s.to}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] no-underline hover:underline mt-2"
                >
                  Open <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[var(--surface2)]">
        <div className="wrap">
          <div className="dopa-card max-w-4xl">
            <div className="eyebrow">Advocacy</div>
            <h2 className="mt-1.5 mb-4">Our struggle</h2>
            <p className="text-[var(--muted)] mb-5">
              DOPA speaks for Doctors of Pharmacy on the issues that shape their careers and patient safety, including:
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {strugglePoints.map((pt, i) => (
                <li
                  key={pt}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]"
                >
                  <span className="font-mono-dopa text-xs font-bold text-[var(--accent)] mt-0.5">
                    0{i + 1}
                  </span>
                  <span className="font-medium text-sm sm:text-base">{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/dopa-association/" className="dopa-btn primary">
                Join the DOPA Association
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M4.3 UNIVERSITIES ================= */
export const UniversitiesPage: React.FC = () => {
  const { universities } = useApp();
  const [cityFilter, setCityFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [appliedCity, setAppliedCity] = useState('All');
  const [appliedSector, setAppliedSector] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'sector'>('name');

  const cities = useMemo(
    () => Array.from(new Set(universities.map((u) => u.city))).sort(),
    [universities]
  );

  const filtered = useMemo(() => {
    return universities
      .filter((u) => (appliedCity === 'All' ? true : u.city === appliedCity))
      .filter((u) => (appliedSector === 'All' ? true : u.sector === appliedSector))
      .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [universities, appliedCity, appliedSector, sortBy]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedCity(cityFilter);
    setAppliedSector(sectorFilter);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Universities' }]}
        eyebrow="Universities"
        title="Where to study Pharm.D"
        intro="Universities and colleges in Pakistan offering the five-year Doctor of Pharmacy (Pharm.D) programme."
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-6">
          <form
            onSubmit={applyFilters}
            className="dopa-card flat grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="uni-city" className="text-xs font-semibold">
                City
              </label>
              <select
                id="uni-city"
                className="dopa-select"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="All">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="uni-sector" className="text-xs font-semibold">
                Sector
              </label>
              <select
                id="uni-sector"
                className="dopa-select"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
              >
                <option value="All">Public and private</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="dopa-btn primary flex-1">
                Filter
              </button>
              {(appliedCity !== 'All' || appliedSector !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setCityFilter('All');
                    setSectorFilter('All');
                    setAppliedCity('All');
                    setAppliedSector('All');
                  }}
                  className="dopa-btn ghost"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="w-6 h-6" />}
              title="No universities match those filters"
              description="Try clearing the city or sector filter to view all recognised institutions."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setCityFilter('All');
                    setSectorFilter('All');
                    setAppliedCity('All');
                    setAppliedSector('All');
                  }}
                  className="dopa-btn sm primary"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto border border-[var(--line)] rounded-2xl bg-[var(--surface)]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[var(--surface2)] border-b border-[var(--line)]">
                    <th className="p-3.5 text-left font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)]">
                      #
                    </th>
                    <th className="p-3.5 text-left font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)]">
                      <button
                        type="button"
                        onClick={() => setSortBy('name')}
                        className="font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                      >
                        University / college {sortBy === 'name' ? '↓' : ''}
                      </button>
                    </th>
                    <th className="p-3.5 text-left font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)]">
                      <button
                        type="button"
                        onClick={() => setSortBy('city')}
                        className="font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                      >
                        City {sortBy === 'city' ? '↓' : ''}
                      </button>
                    </th>
                    <th className="p-3.5 text-left font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)]">
                      <button
                        type="button"
                        onClick={() => setSortBy('sector')}
                        className="font-mono-dopa text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                      >
                        Sector {sortBy === 'sector' ? '↓' : ''}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => (
                    <tr key={u.id} className="border-b border-[var(--line)] last:border-b-0">
                      <td className="p-3.5 text-[var(--muted)] num">{idx + 1}</td>
                      <td className="p-3.5 font-medium">{u.name}</td>
                      <td className="p-3.5 text-[var(--muted)]">{u.city}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            u.sector === 'Public'
                              ? 'bg-[var(--okbg)] text-[var(--ok)]'
                              : 'bg-[var(--infobg)] text-[var(--info)]'
                          }`}
                        >
                          {u.sector}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="dopa-card flat bg-[var(--surface2)]">
            <h3 className="text-lg font-bold mb-2">Before you apply</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Admission is usually based on F.Sc. (Pre-Medical) marks and an entry test. Merit lists, fee structures and closing dates change every year, so always check the university&apos;s own admissions page and the Pharmacy Council of Pakistan&apos;s list of recognised institutions.
            </p>
            <p className="text-sm mt-3">
              Know an institution that is missing?{' '}
              <Link to="/contact/" className="font-semibold">
                Tell DOPA
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M4.4 FAQ ================= */
export const FaqPage: React.FC = () => {
  const { faqs } = useApp();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]}
        eyebrow="Help"
        title="FAQ"
        intro="Answers to common questions about website accounts, DOPA membership, verified pharmacies, videos, and bank transfer payments."
      />

      <section className="pb-12">
        <div className="wrap max-w-3xl">
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="dopa-card flat !p-0 overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-display font-semibold text-base sm:text-lg text-[var(--fg)] hover:bg-[var(--surface2)] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="w-8 h-8 rounded-full border border-[var(--line)] grid place-items-center shrink-0 text-[var(--accent)]">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-[var(--muted)] leading-relaxed border-t border-[var(--line)]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="dopa-card flat bg-[var(--surface2)] mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Still have questions?</h3>
              <p className="text-sm text-[var(--muted)]">
                Send a message to Doctor of Pharmacy (Pharm.D) or the DOPA Association team.
              </p>
            </div>
            <Link to="/contact/" className="dopa-btn primary">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M4.5 CONTACT ================= */
export const ContactPage: React.FC = () => {
  const { settings, submitContactMessage } = useApp();
  const [honeypot, setHoneypot] = useState('');
  const [target, setTarget] = useState<'Doctor of Pharmacy (Pharm.D)' | 'DOPA Association'>(
    'Doctor of Pharmacy (Pharm.D)'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (honeypot.trim() !== '') return;
    if (!name.trim()) return setError('Please enter your name.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (message.trim().length < 5) return setError('Please enter your message.');

    submitContactMessage({ target, name: name.trim(), email: email.trim(), message: message.trim() });
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        eyebrow="Contact"
        title="Contact us"
        intro="Reach Doctor of Pharmacy (Pharm.D) or the DOPA Association. Choose who your message is for."
      />

      <section className="pb-12">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <div className="lg:col-span-7 dopa-card">
            {sent ? (
              <div className="flex flex-col items-start gap-3 py-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--okbg)] text-[var(--ok)] grid place-items-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3>Message received</h3>
                <p className="text-sm text-[var(--muted)]">
                  Your message has been routed to the {target} inbox. We will reply to your email shortly.
                </p>
                <button type="button" onClick={() => setSent(false)} className="dopa-btn sm ghost">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <fieldset className="border-0 p-0 m-0 flex flex-col gap-2.5">
                  <legend className="font-semibold text-sm mb-1">
                    Who do you want to contact? <span className="text-[var(--bad)]">*</span>
                  </legend>
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] cursor-pointer hover:border-[var(--accent)]">
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'Doctor of Pharmacy (Pharm.D)'}
                      onChange={() => setTarget('Doctor of Pharmacy (Pharm.D)')}
                      className="mt-1"
                    />
                    <span>
                      <b className="block text-sm">Doctor of Pharmacy (Pharm.D)</b>
                      <small className="text-xs text-[var(--muted)]">
                        The website, jobs, community, videos, pharmacies, products and orders.
                      </small>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] cursor-pointer hover:border-[var(--accent)]">
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'DOPA Association'}
                      onChange={() => setTarget('DOPA Association')}
                      className="mt-1"
                    />
                    <span>
                      <b className="block text-sm">DOPA Association</b>
                      <small className="text-xs text-[var(--muted)]">
                        DOPA membership, applications, renewals and your DOPA card.
                      </small>
                    </span>
                  </label>
                </fieldset>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="c-name" className="text-sm font-semibold">
                    Your name <span className="text-[var(--bad)]">*</span>
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    className="dopa-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="c-email" className="text-sm font-semibold">
                    Email <span className="text-[var(--bad)]">*</span>
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    className="dopa-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="c-msg" className="text-sm font-semibold">
                    Message <span className="text-[var(--bad)]">*</span>
                  </label>
                  <textarea
                    id="c-msg"
                    className="dopa-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="dopa-notice bad text-sm">{error}</div>}

                <div>
                  <button type="submit" className="dopa-btn primary">
                    Send message
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="dopa-card flex flex-col gap-3">
              <h3>Doctor of Pharmacy (Pharm.D)</h3>
              <p className="text-sm text-[var(--muted)]">
                For website support, jobs, community, videos, pharmacies, products, and orders.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Phone className="w-4 h-4 text-[var(--accent)]" />
                <a href={`tel:${settings.pharmdPhone.replace(/\s+/g, '')}`}>{settings.pharmdPhone}</a>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <a href={settings.facebookPage} target="_blank" rel="noopener noreferrer" className="dopa-btn sm ghost">
                  Facebook page
                </a>
                <a href={settings.facebookGroup} target="_blank" rel="noopener noreferrer" className="dopa-btn sm ghost">
                  Facebook group
                </a>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="dopa-btn sm ghost">
                  Instagram
                </a>
              </div>
            </div>

            <div className="dopa-card flex flex-col gap-3">
              <h3>DOPA Association</h3>
              <p className="text-sm text-[var(--muted)]">
                For membership questions, choose DOPA Association in the form and include your member number if you have one.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[var(--accent)]" />
                <a href={`mailto:${settings.dopaEmail}`}>{settings.dopaEmail}</a>
              </div>
              <div className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>{settings.dopaOffice}</span>
              </div>
              <div className="pt-1">
                <Link to="/dopa-association/" className="dopa-btn sm ghost">
                  DOPA Association page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M4.6 PRIVACY & TERMS ================= */
export const PrivacyPage: React.FC = () => {
  const sections = [
    {
      id: 'collect',
      title: 'What we collect',
      body: 'Account details you give us (name, email, city, optional phone and photo), your DOPA application details and proof of qualification if you apply, pharmacy details if you register a pharmacy, orders you place, and your notification choices with the time you gave consent.',
    },
    {
      id: 'payments',
      title: 'Payments',
      body: 'DOPA does not collect card details. For bank transfers we keep the transfer reference, amount, status and any receipt you upload.',
    },
    {
      id: 'messages',
      title: 'Messages & alerts',
      body: 'We send job alerts, application updates, order notifications, and request replies to your account and email only on channels you enable. You can update notification preferences in Account Settings.',
    },
    {
      id: 'visibility',
      title: 'Who sees your information',
      body: 'Signed-in users can see your name and public posts. Posts marked for DOPA members are visible to active DOPA members only. Administrators can see account, application, CNIC, pharmacy licence, and payment records for verification and audit. Proof documents and CNICs are visible only to you and the admin. The public membership check page displays verification status, initials/name, qualification, city, and expiry date.',
    },
    {
      id: 'matrimonial',
      title: 'Matrimonial privacy',
      body: 'Life partner browsing is restricted to approved paying members of the opposite gender. Your phone number and email address remain hidden until you explicitly accept a member interest request.',
    },
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]}
        eyebrow="Legal · Last updated: 14 November 2026"
        title="Privacy Policy"
        intro="How Doctor of Pharmacy (Pharm.D) and the DOPA Association handle your account, verification documents, and payment records."
      />
      <section className="pb-12">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-32 dopa-card flat">
            <h3 className="text-sm font-mono-dopa uppercase tracking-wider text-[var(--accent)] mb-3">
              Contents
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[var(--fg)] hover:text-[var(--accent)] no-underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          <div className="lg:col-span-8 dopa-card flex flex-col gap-6">
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 className="text-xl font-bold mb-2">{s.title}</h2>
                <p className="text-[var(--muted)] leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const sections = [
    {
      id: 'accounts',
      title: 'Accounts',
      body: 'Accounts are personal. Keep your details accurate and your password private. Each email address may hold one account, and each CNIC may hold one DOPA membership.',
    },
    {
      id: 'membership',
      title: 'DOPA membership',
      body: 'DOPA Association membership is personal, starts when the admin approves your application (and verifies your fee when one applies), and lasts 12 months. Content shared exclusively among DOPA members must not be copied outside the association.',
    },
    {
      id: 'conduct',
      title: 'Conduct',
      body: 'Keep posts, medicine requests, and videos professional and accurate. Do not post patient-identifying information. The admin may hide content or suspend accounts that break these rules.',
    },
    {
      id: 'jobs',
      title: 'Job listings',
      body: 'Whoever posts a job is responsible for its accuracy. The admin checks listings before they go live.',
    },
    {
      id: 'pharmacies',
      title: 'Pharmacies and orders',
      body: 'Each pharmacy is responsible for the products it lists, for prescription rules, and for the orders it accepts. Customers pay the pharmacy directly by bank transfer.',
    },
    {
      id: 'changes',
      title: 'Fee changes',
      body: 'Fees may change for future periods. Amounts already paid and active 12-month memberships are not changed retroactively.',
    },
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Terms of Use' }]}
        eyebrow="Legal · Last updated: 14 November 2026"
        title="Terms of Use"
        intro="Rules governing website accounts, DOPA Association membership, verified pharmacies, job listings, and community conduct."
      />
      <section className="pb-12">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-32 dopa-card flat">
            <h3 className="text-sm font-mono-dopa uppercase tracking-wider text-[var(--accent)] mb-3">
              Contents
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[var(--fg)] hover:text-[var(--accent)] no-underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          <div className="lg:col-span-8 dopa-card flex flex-col gap-6">
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 className="text-xl font-bold mb-2">{s.title}</h2>
                <p className="text-[var(--muted)] leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
