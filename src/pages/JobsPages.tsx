import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JOB_TYPES, PAKISTAN_CITIES } from '../data/seedData';
import type { JobType } from '../types';
import { AuthGate, EmptyState, HoneypotField, PageHeader, StatusBadge } from '../components/ui';
import { daysRemaining, formatDateShort } from '../lib/formatters';

/* ================= M12.1 JOB BOARD (/jobs/) ================= */
export const JobsPage: React.FC = () => {
  const { jobs, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'deadline'>('newest');

  const liveJobs = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return jobs.filter((j) => j.status === 'Live' && j.deadline >= today);
  }, [jobs]);

  const locations = useMemo(
    () => Array.from(new Set(liveJobs.map((j) => j.location))).sort(),
    [liveJobs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = liveJobs.filter((j) => {
      if (locationFilter !== 'All' && j.location !== locationFilter) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(j.type)) return false;
      if (q) {
        const hay = `${j.title} ${j.organisation} ${j.location} ${j.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) =>
      sortBy === 'deadline'
        ? a.deadline.localeCompare(b.deadline)
        : b.postedAt.localeCompare(a.postedAt)
    );
  }, [liveJobs, query, locationFilter, selectedTypes, sortBy]);

  const toggleType = (t: JobType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Jobs' }]}
        eyebrow="Careers"
        title="Job board"
        intro="Hospital, clinical, retail pharmacy, regulatory, and industrial QA/QC openings for Pharm.D graduates and interns across Pakistan."
        actions={
          currentUser ? (
            <Link to="/post-job/" className="dopa-btn primary">
              Post a job
            </Link>
          ) : (
            <Link to="/login/?redirect=%2Fpost-job%2F" className="dopa-btn primary">
              Sign in to post a job
            </Link>
          )
        }
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-6">
          <div className="dopa-card flat flex flex-col gap-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  className="dopa-input pl-10"
                  placeholder="Search role, hospital, company..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="dopa-input"
                aria-label="Filter by location"
              >
                <option value="All">All locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'deadline')}
                className="dopa-input"
                aria-label="Sort jobs"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="deadline">Sort: Deadline soonest</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-[var(--muted)]">Employment type:</span>
              {JOB_TYPES.map((t) => (
                <label key={t} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-6 h-6" />}
              title="No jobs match those filters"
              description="No jobs match those filters. Clear a filter to see more."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setLocationFilter('All');
                    setSelectedTypes([]);
                  }}
                  className="dopa-btn sm ghost"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((job) => {
                const days = daysRemaining(job.deadline);
                return (
                  <article key={job.id} className="dopa-card flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--surface2)] text-[var(--accent)]">
                          {job.type}
                        </span>
                        <span className="text-xs text-[var(--muted)] num">
                          {days > 0 ? `${days}d left` : 'Closes today'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">
                        <Link
                          to={`/jobs/${job.slug}/`}
                          className="text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                        >
                          {job.title}
                        </Link>
                      </h3>
                      <div className="text-sm text-[var(--muted)] mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {job.organisation}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                      </div>
                      {job.salary && (
                        <div className="text-sm font-semibold text-[var(--ok)] mt-2">
                          {job.salary}
                        </div>
                      )}
                      <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
                      <span className="text-xs text-[var(--muted)]">
                        Deadline: {formatDateShort(job.deadline)}
                      </span>
                      <Link to={`/jobs/${job.slug}/`} className="dopa-btn sm primary">
                        View &amp; Apply
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M12.2 JOB DETAIL (/jobs/:slug/) ================= */
export const JobDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { jobs, pushToast } = useApp();
  const job = jobs.find((j) => j.slug === slug);

  if (!job) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="Job listing not found"
            description="This vacancy may have expired or been removed."
            action={
              <Link to="/jobs/" className="dopa-btn primary">
                Back to job board
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const days = daysRemaining(job.deadline);
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).catch(() => {});
    pushToast('Job link copied to clipboard.', 'info');
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Jobs', to: '/jobs/' },
          { label: job.title },
        ]}
        eyebrow={`${job.type} · ${job.location}`}
        title={job.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleShare} className="dopa-btn sm ghost">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <Link to="/jobs/" className="dopa-btn sm ghost">
              <ArrowLeft className="w-4 h-4" /> All jobs
            </Link>
          </div>
        }
      />

      <section className="pb-12">
        <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 dopa-card flex flex-col gap-5">
            <div className="flex flex-wrap gap-4 text-sm pb-4 border-b border-[var(--line)]">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Building2 className="w-4 h-4 text-[var(--accent)]" /> {job.organisation}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--accent)]" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--accent)]" /> Deadline:{' '}
                {formatDateShort(job.deadline)} ({days} days remaining)
              </span>
            </div>

            {job.salary && (
              <div className="p-3.5 rounded-xl bg-[var(--surface2)] text-sm">
                <b>Compensation:</b> {job.salary}
              </div>
            )}

            <div>
              <h3 className="mb-2">Role overview</h3>
              <p className="text-[var(--muted)] leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            <div>
              <h3 className="mb-2">Requirements</h3>
              <p className="text-[var(--muted)] leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4 dopa-card flex flex-col gap-4">
            <StatusBadge status={job.status} />
            <h3>Apply for this position</h3>
            <p className="text-sm text-[var(--muted)]">
              Submit your CV directly to {job.organisation} before {formatDateShort(job.deadline)}.
            </p>

            {job.applyMethod === 'email' && (
              <a
                href={`mailto:${job.applyValue}?subject=${encodeURIComponent(
                  `Application: ${job.title}`
                )}`}
                className="dopa-btn primary w-full"
              >
                <Mail className="w-4 h-4" /> Email {job.applyValue}
              </a>
            )}
            {job.applyMethod === 'phone' && (
              <a href={`tel:${job.applyValue}`} className="dopa-btn primary w-full">
                <Phone className="w-4 h-4" /> Call {job.applyValue}
              </a>
            )}
            {job.applyMethod === 'url' && (
              <a
                href={job.applyValue}
                target="_blank"
                rel="noopener noreferrer"
                className="dopa-btn primary w-full"
              >
                <ExternalLink className="w-4 h-4" /> Apply on employer portal
              </a>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};

/* ================= M12.3 POST A JOB (/post-job/) ================= */
export const PostJobPage: React.FC = () => {
  const { currentUser, postJob, pushToast } = useApp();
  const navigate = useNavigate();

  const [honeypot, setHoneypot] = useState('');
  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [location, setLocation] = useState('Lahore');
  const [type, setType] = useState<JobType>('Full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyMethod, setApplyMethod] = useState<'email' | 'phone' | 'url'>('email');
  const [applyValue, setApplyValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || honeypot.trim()) return;
    if (!title.trim() || !organisation.trim() || !description.trim() || !deadline || !applyValue.trim()) {
      pushToast('Please fill in all required job fields.', 'bad');
      return;
    }
    postJob({
      posterId: currentUser.id,
      title: title.trim(),
      organisation: organisation.trim(),
      location: location.trim(),
      type,
      salary: salary.trim() || undefined,
      description: description.trim(),
      requirements: requirements.trim() || 'Pharm.D degree and valid Pharmacy Council registration.',
      deadline,
      applyMethod,
      applyValue: applyValue.trim(),
    });
    setSubmitted(true);
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Jobs', to: '/jobs/' },
          { label: 'Post a job' },
        ]}
        eyebrow="Employers & Hospitals"
        title="Post a pharmacy job"
        intro="Reach Pharm.D graduates, interns, and clinical pharmacists nationwide. Free to post; reviewed by admin before going live."
      />

      <section className="pb-12">
        <div className="wrap max-w-3xl">
          {!currentUser ? (
            <AuthGate
              title="Sign in to post a job"
              message="Sign in with a free Pharm.D account to submit a job opening for review."
              redirectTo="/post-job/"
            />
          ) : submitted ? (
            <div className="dopa-card text-center py-10 px-6 flex flex-col items-center gap-3">
              <StatusBadge status="Pending" />
              <h2>Submitted for review</h2>
              <p className="text-[var(--muted)] max-w-md">
                Your job will appear on the public job board after admin approval. You can track its status under My Jobs in your account.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <Link to="/account/jobs/" className="dopa-btn primary">
                  View my jobs
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/jobs/')}
                  className="dopa-btn ghost"
                >
                  Back to job board
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="dopa-card flex flex-col gap-4">
              <HoneypotField value={honeypot} onChange={setHoneypot} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="jTitle" className="text-sm font-semibold">
                    Job title *
                  </label>
                  <input
                    id="jTitle"
                    type="text"
                    className="dopa-input"
                    placeholder="e.g. Clinical Pharmacist — ICU"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="jOrg" className="text-sm font-semibold">
                    Hospital / Company / Pharmacy *
                  </label>
                  <input
                    id="jOrg"
                    type="text"
                    className="dopa-input"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="jLoc" className="text-sm font-semibold">
                    City / Location *
                  </label>
                  <select
                    id="jLoc"
                    className="dopa-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="jType" className="text-sm font-semibold">
                    Employment type *
                  </label>
                  <select
                    id="jType"
                    className="dopa-input"
                    value={type}
                    onChange={(e) => setType(e.target.value as JobType)}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="jSalary" className="text-sm font-semibold">
                    Salary range (optional)
                  </label>
                  <input
                    id="jSalary"
                    type="text"
                    className="dopa-input"
                    placeholder="e.g. PKR 75,000 – 95,000 / month"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="jDeadline" className="text-sm font-semibold">
                    Application deadline *
                  </label>
                  <input
                    id="jDeadline"
                    type="date"
                    className="dopa-input"
                    min={new Date().toISOString().slice(0, 10)}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="jDesc" className="text-sm font-semibold">
                  Job description *
                </label>
                <textarea
                  id="jDesc"
                  rows={4}
                  className="dopa-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="jReq" className="text-sm font-semibold">
                  Requirements &amp; experience
                </label>
                <textarea
                  id="jReq"
                  rows={3}
                  className="dopa-input"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Pharm.D (HEC recognized), Category-A registration, relevant hospital/QA experience..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="jMethod" className="text-sm font-semibold">
                    How candidates apply *
                  </label>
                  <select
                    id="jMethod"
                    className="dopa-input"
                    value={applyMethod}
                    onChange={(e) => setApplyMethod(e.target.value as 'email' | 'phone' | 'url')}
                  >
                    <option value="email">Email address</option>
                    <option value="phone">Phone number</option>
                    <option value="url">External portal URL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="jApplyVal" className="text-sm font-semibold">
                    {applyMethod === 'email'
                      ? 'HR email address *'
                      : applyMethod === 'phone'
                      ? 'Contact phone *'
                      : 'Application URL *'}
                  </label>
                  <input
                    id="jApplyVal"
                    type={applyMethod === 'email' ? 'email' : applyMethod === 'url' ? 'url' : 'tel'}
                    className="dopa-input"
                    value={applyValue}
                    onChange={(e) => setApplyValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="dopa-btn primary">
                Submit job for review
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
