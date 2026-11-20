import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUALIFICATIONS } from '../data/seedData';
import type { Qualification } from '../types';
import {
  AuthGate,
  FileUpload,
  HoneypotField,
  MemberCard,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { formatCnicMask, formatDateLong, isValidCnic } from '../lib/formatters';

/* ================= M6.1-M6.2 DOPA ASSOCIATION (/dopa-association/) ================= */
export const DopaAssociationPage: React.FC = () => {
  const {
    currentUser,
    currentMembership,
    settings,
    universities,
    applyDopaMembership,
  } = useApp();

  const [honeypot, setHoneypot] = useState('');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [qualification, setQualification] = useState<Qualification | ''>(
    currentUser?.qualification || ''
  );
  const [councilRegNo, setCouncilRegNo] = useState('');
  const [university, setUniversity] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [city, setCity] = useState(currentUser?.city || '');
  const [proofName, setProofName] = useState('');
  const [proofData, setProofData] = useState('');
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName((v) => v || currentUser.name);
      setEmail(currentUser.email);
      setPhone((v) => v || currentUser.phone || '');
      setQualification((v) => v || currentUser.qualification);
      setCity((v) => v || currentUser.city);
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentUser) return;
    if (honeypot.trim() !== '') return;
    if (!fullName.trim()) return setError('Full name is required.');
    if (!isValidCnic(cnic)) return setError('Please enter a valid 13-digit CNIC (00000-0000000-0).');
    if (!phone.trim()) return setError('Phone number is required.');
    if (!gender) return setError('Please select your gender.');
    if (!qualification) return setError('Please select your qualification.');
    if (!university.trim()) return setError('University or college is required.');
    if (!gradYear.trim()) return setError('Graduation year (or expected) is required.');
    if (!city.trim()) return setError('City is required.');
    if (!proofName) return setError('Proof of qualification is required.');
    if (!confirmTerms) return setError('Please confirm your details are true and accept the terms.');

    const res = applyDopaMembership({
      userId: currentUser.id,
      fullName: fullName.trim(),
      email: email.trim(),
      cnic: cnic.trim(),
      phone: phone.trim(),
      gender,
      qualification: qualification as Qualification,
      councilRegNo: councilRegNo.trim() || undefined,
      university: university.trim(),
      gradYear: gradYear.trim(),
      workplace: workplace.trim() || undefined,
      city: city.trim(),
      proofFileName: proofName,
      proofFileData: proofData,
    });

    if (!res.ok) {
      setError(res.error || 'Could not submit application.');
      return;
    }
    setSubmitted(true);
  };

  const benefits = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Members-only content',
      text: 'Read everything published on the site, plus articles, posts and videos shared only among DOPA members.',
    },
    {
      icon: <Megaphone className="w-5 h-5" />,
      title: 'A voice for Pharm.D',
      text: 'Join the association working for the recognition, rights and service structure of Doctors of Pharmacy.',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Verified member card',
      text: 'A digital DOPA card with your member number and a QR code anyone can check.',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Network and jobs',
      text: 'Meet colleagues across Pakistan, share cases and opportunities, and follow the job board.',
    },
  ];

  const previewCard = currentMembership || {
    fullName: currentUser?.name || 'Dr. Ali Raza',
    qualification: currentUser?.qualification || 'Pharm.D',
    city: currentUser?.city || 'Lahore',
    memberNo: 'DOPA-00012',
    expiresAt: '2027-02-17T12:00:00Z',
    status: 'Approved' as const,
  };

  return (
    <div>
      {/* Hero */}
      <section className="dz py-12 md:py-16">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/img/dopa-assoc-logo.png"
                alt="DOPA Association Logo"
                className="w-16 h-16 rounded-full bg-white object-contain p-1"
              />
              <div>
                <div className="eyebrow">DOPA Association</div>
                <div className="text-sm text-[#9DB5C4]">Doctor of Pharmacy Association Pakistan</div>
              </div>
            </div>
            <h1 className="text-white">Join the association of Pakistan&apos;s Doctors of Pharmacy.</h1>
            <p className="text-[#C8DDE6] max-w-xl leading-relaxed">
              Membership is yearly, reviewed by the admin, and opens content shared only among members.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#apply"
                className="dopa-btn bg-[#83E5D2] text-[#06222B] hover:bg-[#A3F0E0]"
              >
                Apply for membership
              </a>
              <Link
                to="/verify-member/"
                className="dopa-btn ghost text-[#E8F3F6] border-[#83E5D2]/40 hover:border-[#83E5D2]"
              >
                Verify a member
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <MemberCard membership={previewCard} showActions={Boolean(currentMembership)} />
          </div>
        </div>
      </section>

      {/* Plan & Benefits */}
      <section className="py-12">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <div className="lg:col-span-5 dopa-card bg-gradient-to-br from-[#081A2B] to-[#102F4B] text-[#E8F3F6] border-[#83E5D2]/30 flex flex-col gap-4">
            <div className="eyebrow">Annual membership</div>
            <div className="font-display font-extrabold text-4xl text-white">
              {settings.dopaFee === 0 ? 'Free for now' : `PKR ${settings.dopaFee.toLocaleString()}`}
            </div>
            <p className="text-sm text-[#C8DDE6]">
              12 months from approval. The admin checks your qualification before membership starts.
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#12A889] shrink-0 mt-0.5" />
                <span>Members-only articles, posts and videos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#12A889] shrink-0 mt-0.5" />
                <span>Verified digital DOPA member card with QR check</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#12A889] shrink-0 mt-0.5" />
                <span>Separate from normal website and pharmacy accounts</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="dopa-card flat flex flex-col gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] text-[var(--accent)] grid place-items-center">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold">{b.title}</h3>
                <p className="text-sm text-[var(--muted)]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Section */}
      <section id="apply" className="pb-12">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <div className="lg:col-span-8">
            {!currentUser ? (
              <AuthGate
                title="Sign in to apply for DOPA membership"
                message="Create a free website account or sign in first, then submit your CNIC and qualification proof from this page."
              />
            ) : currentMembership && !submitted && currentMembership.status !== 'Rejected' ? (
              <div className="dopa-card flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2>Your DOPA Membership Application</h2>
                  <StatusBadge status={currentMembership.status} />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Member number: <b className="font-mono-dopa text-[var(--fg)]">{currentMembership.memberNo}</b> &middot; Submitted on {formatDateLong(currentMembership.submittedAt)}
                </p>
                {currentMembership.status === 'Pending' && (
                  <div className="dopa-notice">
                    Your application is currently under review by the DOPA admin team.
                  </div>
                )}
                {currentMembership.status === 'Approved' && (
                  <MemberCard membership={currentMembership} showActions />
                )}
                <Link to="/account/membership/" className="dopa-btn sm ghost self-start">
                  Manage in My Account
                </Link>
              </div>
            ) : submitted ? (
              <div className="dopa-card flex flex-col gap-3 py-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--okbg)] text-[var(--ok)] grid place-items-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2>Application received — you&apos;ll get an email with the decision.</h2>
                <p className="text-sm text-[var(--muted)]">
                  The admin reviews every application and verifies your qualification proof before issuing your DOPA member number and card.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <Link to="/account/membership/" className="dopa-btn sm primary">
                    View application status
                  </Link>
                  <Link to="/" className="dopa-btn sm ghost">
                    Return home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="dopa-card">
                <h2 className="mb-1">Apply for DOPA membership</h2>
                <p className="text-sm text-[var(--muted)] mb-5">
                  The admin reviews every application. Anything a DOPA member posts is visible to DOPA members only.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  <HoneypotField value={honeypot} onChange={setHoneypot} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-name" className="text-sm font-semibold">
                        Full name <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="m-name"
                        type="text"
                        className="dopa-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-email" className="text-sm font-semibold">
                        Email <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="m-email"
                        type="email"
                        className="dopa-input opacity-80"
                        value={email}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-cnic" className="text-sm font-semibold">
                        CNIC number <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="m-cnic"
                        type="text"
                        className="dopa-input font-mono-dopa"
                        placeholder="00000-0000000-0"
                        value={cnic}
                        onChange={(e) => setCnic(formatCnicMask(e.target.value))}
                        required
                      />
                      <span className="text-xs text-[var(--muted)]">
                        Visible only to admin. Required so each person holds one DOPA membership.
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-phone" className="text-sm font-semibold">
                        Phone number <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="m-phone"
                        type="tel"
                        className="dopa-input"
                        placeholder="03XX-XXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm font-semibold mb-2">
                        Gender <span className="text-[var(--bad)]">*</span>
                      </span>
                      <div className="flex gap-4">
                        {(['Male', 'Female'] as const).map((g) => (
                          <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === g}
                              onChange={() => setGender(g)}
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-qual" className="text-sm font-semibold">
                        Qualification <span className="text-[var(--bad)]">*</span>
                      </label>
                      <select
                        id="m-qual"
                        className="dopa-select"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value as Qualification)}
                        required
                      >
                        <option value="">Select</option>
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-uni" className="text-sm font-semibold">
                        University or college <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="m-uni"
                        list="uni-suggestions"
                        className="dopa-input"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="Select or type institution"
                        required
                      />
                      <datalist id="uni-suggestions">
                        {universities.map((u) => (
                          <option key={u.id} value={u.name} />
                        ))}
                      </datalist>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-grad" className="text-sm font-semibold">
                        Graduation year (or expected) <span className="text-[var(--bad)]">*</span>
                      </label>
                      <select
                        id="m-grad"
                        className="dopa-select"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        required
                      >
                        <option value="">Select year</option>
                        {Array.from({ length: 35 }, (_, i) => String(2031 - i)).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-reg" className="text-sm font-semibold">
                        Pharmacy Council reg. no. (if any)
                      </label>
                      <input
                        id="m-reg"
                        type="text"
                        className="dopa-input"
                        value={councilRegNo}
                        onChange={(e) => setCouncilRegNo(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-work" className="text-sm font-semibold">
                        Current workplace (optional)
                      </label>
                      <input
                        id="m-work"
                        type="text"
                        className="dopa-input"
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="m-city" className="text-sm font-semibold">
                        City <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="m-city"
                        type="text"
                        className="dopa-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <FileUpload
                    id="m-proof"
                    label="Proof of qualification (photo or PDF)"
                    hint="Degree, transcript, student card or Pharmacy Council registration. JPG, PNG, WebP or PDF up to 5 MB. Only the admin can see it."
                    fileName={proofName}
                    fileData={proofData}
                    onFileSelect={(n, d) => {
                      setProofName(n);
                      setProofData(d);
                    }}
                    onClear={() => {
                      setProofName('');
                      setProofData('');
                    }}
                    required
                  />

                  <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmTerms}
                      onChange={(e) => setConfirmTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      I confirm these details are true and accept the{' '}
                      <Link to="/terms/">terms</Link> and <Link to="/privacy/">privacy policy</Link>.
                    </span>
                  </label>

                  {error && <div className="dopa-notice bad text-sm">{error}</div>}

                  <button type="submit" className="dopa-btn primary">
                    Submit application
                  </button>
                </form>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-5">
            <div className="dopa-card flex flex-col gap-3">
              <h3>DOPA Association office</h3>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <a href={`mailto:${settings.dopaEmail}`}>{settings.dopaEmail}</a>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  {settings.dopaPhones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/\s+/g, '')}`}>
                      {p}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>{settings.dopaOffice}</span>
              </div>
              <div className="pt-2">
                <a
                  href={settings.facebookPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dopa-btn sm ghost"
                >
                  DOPA on Facebook
                </a>
              </div>
            </div>

            <div className="dopa-card flat bg-[var(--surface2)] text-sm text-[var(--muted)]">
              <b className="text-[var(--fg)] block mb-1">Important note</b>
              DOPA membership is separate from a normal website account and from pharmacy accounts. Anything a DOPA member posts is visible to DOPA members only.
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

/* ================= M6.5 VERIFY A MEMBER (/verify-member/) ================= */
export const VerifyMemberPage: React.FC = () => {
  const { memberships, settings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNo = searchParams.get('no') || '';

  const [memberNoInput, setMemberNoInput] = useState(initialNo);
  const [checkedNo, setCheckedNo] = useState(initialNo);

  useEffect(() => {
    const q = searchParams.get('no') || '';
    if (q) {
      setMemberNoInput(q);
      setCheckedNo(q);
    }
  }, [searchParams]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = memberNoInput.trim().toUpperCase();
    setCheckedNo(cleaned);
    if (cleaned) {
      setSearchParams({ no: cleaned });
    } else {
      setSearchParams({});
    }
  };

  const match = checkedNo
    ? memberships.find((m) => m.memberNo.toUpperCase() === checkedNo.toUpperCase())
    : null;

  const isExpired =
    match &&
    (match.status === 'Expired' ||
      match.status === 'Revoked' ||
      (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Verify a member' }]}
        eyebrow="Membership check"
        title="Verify a DOPA member"
        intro="Enter a DOPA member number (or scan the QR code on a digital DOPA card) to check membership validity."
      />

      <section className="pb-14">
        <div className="wrap max-w-xl flex flex-col gap-6">
          <form onSubmit={handleCheck} className="dopa-card flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex flex-col gap-1.5 flex-1 w-full">
              <label htmlFor="vm-no" className="text-sm font-semibold">
                Member number
              </label>
              <input
                id="vm-no"
                type="text"
                className="dopa-input font-mono-dopa"
                placeholder="e.g. DOPA-00012"
                value={memberNoInput}
                onChange={(e) => setMemberNoInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="dopa-btn primary w-full sm:w-auto">
              <Search className="w-4 h-4" /> Check
            </button>
          </form>

          {checkedNo && (
            <div className="dopa-card">
              {!match || match.status === 'Pending' || match.status === 'Rejected' ? (
                <div className="flex items-start gap-3 text-[var(--bad)]">
                  <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold">No member found with this number</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      The member number <span className="font-mono-dopa">{checkedNo}</span> does not match an active DOPA record.
                    </p>
                  </div>
                </div>
              ) : isExpired ? (
                <div className="flex items-start gap-3 text-[var(--warn)]">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold">Membership Expired / Inactive</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      <b>{match.fullName}</b> ({match.memberNo}) &middot; {match.qualification} &middot; {match.city}
                    </p>
                    {match.expiresAt && (
                      <p className="text-xs text-[var(--muted)] mt-1">
                        Expired on {formatDateLong(match.expiresAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 text-[var(--ok)]">
                    <ShieldCheck className="w-7 h-7 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold">Verified DOPA Member</h3>
                      <p className="text-sm text-[var(--muted)]">
                        Active membership confirmed by Doctor of Pharmacy Association Pakistan.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--surface2)] text-sm">
                    <div>
                      <div className="text-xs text-[var(--muted)]">Member Name</div>
                      <div className="font-bold">{match.fullName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--muted)]">Member Number</div>
                      <div className="font-mono-dopa font-bold">{match.memberNo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--muted)]">Qualification</div>
                      <div className="font-semibold">{match.qualification}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--muted)]">City</div>
                      <div className="font-semibold">{match.city}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-[var(--muted)]">Valid until</div>
                      <div className="font-semibold num">
                        {match.expiresAt ? formatDateLong(match.expiresAt) : 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <a
              href={settings.facebookPage}
              target="_blank"
              rel="noopener noreferrer"
              className="dopa-btn sm ghost"
            >
              Follow the DOPA Association
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
