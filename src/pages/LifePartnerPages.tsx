import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PAKISTAN_CITIES, QUALIFICATIONS } from '../data/seedData';
import type { Qualification } from '../types';
import {
  AuthGate,
  BankDetailsBox,
  EmptyState,
  FileUpload,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { formatDateShort, formatPKR } from '../lib/formatters';

/* ================= M13.1 LIFE PARTNER LANDING (/life-partner/) ================= */
export const LifePartnerLandingPage: React.FC = () => {
  const { currentUser, currentLpProfile, isApprovedLpMember, settings, lpRequests } = useApp();

  const receivedCount = currentUser
    ? lpRequests.filter((r) => r.toUserId === currentUser.id && r.status === 'Pending').length
    : 0;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Find a Life Partner' }]}
        eyebrow="Matrimonial Service"
        title="Find a life partner"
        intro="A respectful, admin-verified matrimonial platform built exclusively for Pakistani pharmacy graduates and their families."
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-8">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified profiles',
                desc: 'Every profile and fee receipt is manually checked by DOPA admin before becoming visible.',
              },
              {
                icon: Lock,
                title: 'Contact stays private',
                desc: 'Phone numbers and email addresses stay hidden until you explicitly accept an interest request.',
              },
              {
                icon: Heart,
                title: 'For our community',
                desc: 'Connect with Pharm.D, M.Phil, hospital, and industrial pharmacy professionals across Pakistan.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="dopa-card flat flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] text-[var(--accent)] grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3>{item.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Plan Card */}
          <div className="dopa-card flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="eyebrow mb-1">12-Month Matrimonial Access</div>
              <h2 className="text-2xl font-extrabold num">
                {formatPKR(settings.lifePartnerFee)} / 12 months
              </h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                Includes profile publishing, opposite-gender search filters, and private interest requests.
              </p>
            </div>
            {!currentUser ? (
              <Link to="/login/?redirect=%2Flife-partner%2Fprofile%2F" className="dopa-btn primary">
                Sign in to create profile
              </Link>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <Link to="/life-partner/profile/" className="dopa-btn ghost">
                  {currentLpProfile ? 'Edit my profile' : 'Create my profile'}
                </Link>
                {currentLpProfile && currentLpProfile.paymentStatus !== 'Approved' && (
                  <Link to="/life-partner/payment/" className="dopa-btn primary">
                    Pay membership fee
                  </Link>
                )}
                {isApprovedLpMember && (
                  <Link to="/life-partner/browse/" className="dopa-btn primary">
                    Browse profiles
                  </Link>
                )}
                <Link to="/life-partner/requests/" className="dopa-btn ghost">
                  Requests {receivedCount > 0 ? `(${receivedCount})` : ''}
                </Link>
              </div>
            )}
          </div>

          {!currentUser ? (
            <AuthGate
              title="Sign in to access Find a Life Partner"
              message="Profiles and interest requests are private to signed-in pharmacy community members."
              redirectTo="/life-partner/"
            />
          ) : currentLpProfile ? (
            <div className="dopa-card flat flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold">{currentLpProfile.name}</span>
                  <StatusBadge status={`Profile: ${currentLpProfile.status}`} />
                  <StatusBadge status={`Payment: ${currentLpProfile.paymentStatus}`} />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {currentLpProfile.gender} · {currentLpProfile.age} yrs · {currentLpProfile.city} ·{' '}
                  {currentLpProfile.qualification}
                </p>
              </div>
              {isApprovedLpMember ? (
                <Link to="/life-partner/browse/" className="dopa-btn sm primary">
                  Browse opposite-gender profiles
                </Link>
              ) : (
                <Link to="/life-partner/payment/" className="dopa-btn sm primary">
                  Complete fee / check status
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

/* ================= M13.2 5-STEP PROFILE WIZARD (/life-partner/profile/) ================= */
export const LifePartnerProfilePage: React.FC = () => {
  const { currentUser, currentLpProfile, saveLpProfile, pushToast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [name, setName] = useState(currentLpProfile?.name || currentUser?.name || '');
  const [gender, setGender] = useState<'Male' | 'Female'>(currentLpProfile?.gender || 'Male');
  const [dob, setDob] = useState(currentLpProfile?.dob || '1998-06-15');
  const [height, setHeight] = useState(currentLpProfile?.height || `5'7"`);
  const [maritalStatus, setMaritalStatus] = useState<'Never married' | 'Divorced' | 'Widowed'>(
    currentLpProfile?.maritalStatus || 'Never married'
  );
  const [city, setCity] = useState(currentLpProfile?.city || currentUser?.city || 'Lahore');
  const [qualification, setQualification] = useState<Qualification>(
    currentLpProfile?.qualification || currentUser?.qualification || 'Pharm.D'
  );
  const [profession, setProfession] = useState(currentLpProfile?.profession || '');
  const [workplace, setWorkplace] = useState(currentLpProfile?.workplace || '');
  const [familyDetails, setFamilyDetails] = useState(currentLpProfile?.familyDetails || '');
  const [religionSect, setReligionSect] = useState(currentLpProfile?.religionSect || '');
  const [about, setAbout] = useState(currentLpProfile?.about || '');
  const [expectations, setExpectations] = useState(currentLpProfile?.expectations || '');
  const [photo, setPhoto] = useState(currentLpProfile?.photo || '');
  const [photoName, setPhotoName] = useState(currentLpProfile?.photo ? 'profile-photo.jpg' : '');
  const [blurPhoto, setBlurPhoto] = useState(currentLpProfile?.blurPhotoToNonMembers ?? true);
  const [createdBy, setCreatedBy] = useState<'Self' | 'Parent' | 'Sibling'>(
    currentLpProfile?.createdBy || 'Self'
  );
  const [phone, setPhone] = useState(currentLpProfile?.phone || currentUser?.phone || '');
  const [email, setEmail] = useState(currentLpProfile?.email || currentUser?.email || '');

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Create your Life Partner profile"
            message="Sign in first so your profile and privacy preferences stay linked to your account."
            redirectTo="/life-partner/profile/"
          />
        </div>
      </div>
    );
  }

  const calcAge = (d: string) => {
    const birth = new Date(d);
    if (Number.isNaN(birth.getTime())) return 26;
    const diff = Date.now() - birth.getTime();
    return Math.max(18, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !profession.trim() || !phone.trim() || !email.trim()) {
      pushToast('Please complete required personal and contact fields.', 'bad');
      return;
    }
    const saved = saveLpProfile({
      id: currentLpProfile?.id,
      userId: currentUser.id,
      name: name.trim(),
      gender,
      dob,
      age: calcAge(dob),
      height: height.trim(),
      maritalStatus,
      city: city.trim(),
      qualification,
      profession: profession.trim(),
      workplace: workplace.trim() || 'Not specified',
      familyDetails: familyDetails.trim() || 'Details shared on acceptance.',
      religionSect: religionSect.trim() || undefined,
      about: about.trim() || 'Pharmacy professional seeking a compatible partner.',
      expectations: expectations.trim() || 'Educated, respectful family background.',
      photo: photo || undefined,
      blurPhotoToNonMembers: blurPhoto,
      createdBy,
      phone: phone.trim(),
      email: email.trim(),
    });
    if (saved.paymentStatus === 'Approved') {
      navigate('/life-partner/browse/');
    } else {
      navigate('/life-partner/payment/');
    }
  };

  const stepLabels = [
    '1. Basic details',
    '2. Education & work',
    '3. Family & about',
    '4. Photo & privacy',
    '5. Guardian & contact',
  ];

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Life Partner', to: '/life-partner/' },
          { label: 'My Profile' },
        ]}
        eyebrow="5-Step Profile Wizard"
        title={currentLpProfile ? 'Edit Life Partner profile' : 'Create Life Partner profile'}
      />

      <section className="pb-12">
        <div className="wrap max-w-3xl flex flex-col gap-5">
          {/* Progress */}
          <div className="flex flex-wrap gap-2">
            {stepLabels.map((lbl, idx) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setStep(idx + 1)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                  step === idx + 1
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <form onSubmit={handleSave} className="dopa-card flex flex-col gap-4">
            {step === 1 && (
              <>
                <h3>Step 1: Basic details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Full name *</label>
                    <input
                      type="text"
                      className="dopa-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Gender *</label>
                    <select
                      className="dopa-input"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Date of birth *</label>
                    <input
                      type="date"
                      className="dopa-input"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Height *</label>
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder={`e.g. 5'8"`}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Marital status *</label>
                    <select
                      className="dopa-input"
                      value={maritalStatus}
                      onChange={(e) =>
                        setMaritalStatus(e.target.value as 'Never married' | 'Divorced' | 'Widowed')
                      }
                    >
                      <option value="Never married">Never married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">City *</label>
                    <select
                      className="dopa-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Step 2: Education &amp; work</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Qualification *</label>
                    <select
                      className="dopa-input"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value as Qualification)}
                    >
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Profession / Title *</label>
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder="e.g. Clinical Pharmacist / QA Officer"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Workplace / Hospital / University</label>
                    <input
                      type="text"
                      className="dopa-input"
                      value={workplace}
                      onChange={(e) => setWorkplace(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3>Step 3: Family &amp; expectations</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Family background</label>
                    <textarea
                      rows={3}
                      className="dopa-input"
                      value={familyDetails}
                      onChange={(e) => setFamilyDetails(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Religion / Sect (optional)</label>
                    <input
                      type="text"
                      className="dopa-input"
                      value={religionSect}
                      onChange={(e) => setReligionSect(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">About yourself</label>
                    <textarea
                      rows={3}
                      className="dopa-input"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Partner expectations</label>
                    <textarea
                      rows={3}
                      className="dopa-input"
                      value={expectations}
                      onChange={(e) => setExpectations(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h3>Step 4: Photo &amp; privacy</h3>
                <FileUpload
                  id="lpPhoto"
                  label="Profile photograph (optional)"
                  accept=".jpg,.jpeg,.png,.webp"
                  hint="JPG, PNG or WebP up to 5 MB."
                  fileName={photoName}
                  fileData={photo}
                  onFileSelect={(n, d) => {
                    setPhotoName(n);
                    setPhoto(d);
                  }}
                  onClear={() => {
                    setPhotoName('');
                    setPhoto('');
                  }}
                />
                <label className="flex items-start gap-2.5 text-sm cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={blurPhoto}
                    onChange={(e) => setBlurPhoto(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    Blur my photo for non-DOPA members (full photo stays clear for verified DOPA members)
                  </span>
                </label>
              </>
            )}

            {step === 5 && (
              <>
                <h3>Step 5: Guardian &amp; private contact</h3>
                <p className="text-sm text-[var(--muted)]">
                  Your phone and email remain hidden until you accept an interest request.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Profile managed by</label>
                    <select
                      className="dopa-input"
                      value={createdBy}
                      onChange={(e) => setCreatedBy(e.target.value as 'Self' | 'Parent' | 'Sibling')}
                    >
                      <option value="Self">Self</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Contact phone *</label>
                    <input
                      type="tel"
                      className="dopa-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Contact email *</label>
                  <input
                    type="email"
                    className="dopa-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="dopa-btn sm ghost"
              >
                Previous
              </button>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(5, s + 1))}
                  className="dopa-btn sm primary"
                >
                  Next step
                </button>
              ) : (
                <button type="submit" className="dopa-btn primary">
                  Save profile &amp; continue
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

/* ================= M13.3 PAYMENT PAGE (/life-partner/payment/) ================= */
export const LifePartnerPaymentPage: React.FC = () => {
  const { currentUser, currentLpProfile, settings, submitLpPayment, pushToast } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [paymentRef, setPaymentRef] = useState(currentLpProfile?.paymentRef || '');
  const [receiptName, setReceiptName] = useState('');
  const [receiptData, setReceiptData] = useState('');

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Life Partner Membership Payment"
            message="Sign in first to pay your 12-month matrimonial access fee."
            redirectTo="/life-partner/payment/"
          />
        </div>
      </div>
    );
  }

  if (!currentLpProfile) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<Heart className="w-6 h-6" />}
            title="Create your profile first"
            description="Complete the 5-step Life Partner profile wizard before submitting payment."
            action={
              <Link to="/life-partner/profile/" className="dopa-btn primary">
                Create profile
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed || !paymentRef.trim()) {
      pushToast('Please confirm payment and enter your transaction reference.', 'bad');
      return;
    }
    submitLpPayment(currentLpProfile.id, paymentRef.trim(), receiptName || undefined, receiptData || undefined);
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Life Partner', to: '/life-partner/' },
          { label: 'Membership Payment' },
        ]}
        eyebrow="12-Month Matrimonial Plan"
        title="Complete Life Partner payment"
      />

      <section className="pb-12">
        <div className="wrap max-w-2xl flex flex-col gap-5">
          {currentLpProfile.paymentStatus === 'Pending' ? (
            <div className="dopa-card flex flex-col gap-3">
              <StatusBadge status="Pending admin approval" />
              <h2>Payment submitted</h2>
              <p className="text-sm text-[var(--muted)]">
                Transfer reference <span className="font-mono-dopa">{currentLpProfile.paymentRef}</span> is under review by DOPA admin. Once approved, you can browse opposite-gender profiles.
              </p>
              <Link to="/life-partner/" className="dopa-btn sm ghost self-start">
                Back to Life Partner home
              </Link>
            </div>
          ) : currentLpProfile.paymentStatus === 'Approved' ? (
            <div className="dopa-card flex flex-col gap-3">
              <StatusBadge status="Approved" />
              <h2>Membership active</h2>
              <p className="text-sm text-[var(--muted)]">
                Valid until {currentLpProfile.expiresAt ? formatDateShort(currentLpProfile.expiresAt) : '12 months'}.
              </p>
              <Link to="/life-partner/browse/" className="dopa-btn primary self-start">
                Browse profiles
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <BankDetailsBox
                bank={settings.lifePartnerBank}
                amount={settings.lifePartnerFee}
                remarkInstruction={`Enter "${currentLpProfile.name} - Life Partner" in bank transfer remark.`}
                confirmed={confirmed}
                onToggleConfirm={() => setConfirmed(true)}
                paymentRef={paymentRef}
                onPaymentRefChange={setPaymentRef}
                receiptFileName={receiptName}
                receiptFileData={receiptData}
                onReceiptSelect={(n, d) => {
                  setReceiptName(n);
                  setReceiptData(d);
                }}
                onReceiptClear={() => {
                  setReceiptName('');
                  setReceiptData('');
                }}
              />
              {confirmed && (
                <button type="submit" className="dopa-btn primary">
                  Submit payment for approval
                </button>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M13.4 BROWSE PROFILES (/life-partner/browse/) ================= */
export const LifePartnerBrowsePage: React.FC = () => {
  const {
    currentUser,
    currentLpProfile,
    isApprovedLpMember,
    isActiveDopaMember,
    lpProfiles,
  } = useApp();

  const [city, setCity] = useState('All');
  const [qualification, setQualification] = useState('All');
  const [maritalStatus, setMaritalStatus] = useState('All');
  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(45);

  const visibleProfiles = useMemo(() => {
    if (!currentLpProfile) return [];
    // Strict opposite-gender rule
    return lpProfiles.filter((p) => {
      if (p.id === currentLpProfile.id) return false;
      if (p.status !== 'Approved' || p.paymentStatus !== 'Approved') return false;
      if (p.gender === currentLpProfile.gender) return false;
      if (city !== 'All' && p.city !== city) return false;
      if (qualification !== 'All' && p.qualification !== qualification) return false;
      if (maritalStatus !== 'All' && p.maritalStatus !== maritalStatus) return false;
      if (p.age < minAge || p.age > maxAge) return false;
      return true;
    });
  }, [lpProfiles, currentLpProfile, city, qualification, maritalStatus, minAge, maxAge]);

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Browse Life Partner profiles"
            message="Sign in with an approved Life Partner membership to browse opposite-gender profiles."
            redirectTo="/life-partner/browse/"
          />
        </div>
      </div>
    );
  }

  if (!currentLpProfile) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<UserCheck className="w-6 h-6" />}
            title="Create your Life Partner profile first"
            description="Your own profile determines opposite-gender matching and enables interest requests."
            action={
              <Link to="/life-partner/profile/" className="dopa-btn primary">
                Create profile
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (!isApprovedLpMember) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<Lock className="w-6 h-6" />}
            title="Membership approval required to browse"
            description={`Your profile is currently "${currentLpProfile.status}" and payment is "${currentLpProfile.paymentStatus}".`}
            action={
              <Link to="/life-partner/payment/" className="dopa-btn primary">
                Complete payment / view status
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Life Partner', to: '/life-partner/' },
          { label: 'Browse Profiles' },
        ]}
        eyebrow={`Showing ${currentLpProfile.gender === 'Male' ? 'Female' : 'Male'} Profiles`}
        title="Browse verified profiles"
        actions={
          <Link to="/life-partner/requests/" className="dopa-btn sm ghost">
            My requests
          </Link>
        }
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-6">
          <div className="dopa-card flat grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select className="dopa-input" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="All">All cities</option>
              {PAKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="dopa-input"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
            >
              <option value="All">All qualifications</option>
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <select
              className="dopa-input"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
            >
              <option value="All">Any marital status</option>
              <option value="Never married">Never married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
            <input
              type="number"
              className="dopa-input"
              min={18}
              max={60}
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value) || 18)}
              aria-label="Minimum age"
              placeholder="Min age"
            />
            <input
              type="number"
              className="dopa-input"
              min={18}
              max={65}
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value) || 45)}
              aria-label="Maximum age"
              placeholder="Max age"
            />
          </div>

          {visibleProfiles.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-6 h-6" />}
              title="No profiles match those filters"
              description="Try widening the age range or clearing a city filter."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleProfiles.map((p) => {
                const shouldBlur = p.blurPhotoToNonMembers && !isActiveDopaMember;
                return (
                  <article key={p.id} className="dopa-card flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--surface2)] grid place-items-center font-display font-bold text-xl text-[var(--accent)] overflow-hidden shrink-0">
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt={p.name}
                              className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                            />
                          ) : (
                            p.name
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((x) => x[0])
                              .join('')
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{p.name}</h3>
                          <div className="text-xs text-[var(--muted)]">
                            {p.age} yrs · {p.height} · {p.maritalStatus}
                          </div>
                          <div className="text-xs text-[var(--accent)] font-semibold mt-0.5">
                            {p.qualification}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="font-semibold">{p.profession}</div>
                        <div className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {p.city} · Managed by {p.createdBy}
                        </div>
                      </div>

                      <p className="text-sm text-[var(--muted)] line-clamp-2">{p.about}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
                      <span className="text-xs text-[var(--muted)] inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Contact private
                      </span>
                      <Link to={`/life-partner/${p.id}`} className="dopa-btn sm primary">
                        View profile
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

/* ================= M13.5 PROFILE DETAIL (/life-partner/:id) ================= */
export const LifePartnerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    currentUser,
    currentLpProfile,
    isActiveDopaMember,
    lpProfiles,
    lpRequests,
    sendLpRequest,
    respondLpRequest,
  } = useApp();
  const [note, setNote] = useState('');

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Sign in to view profile"
            message="Matrimonial profiles are private to signed-in Life Partner members."
          />
        </div>
      </div>
    );
  }

  const profile = lpProfiles.find((p) => p.id === id);
  if (!profile) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<Heart className="w-6 h-6" />}
            title="Profile not found"
            action={
              <Link to="/life-partner/browse/" className="dopa-btn primary">
                Back to browse
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const existingReq = lpRequests.find(
    (r) =>
      (r.fromUserId === currentUser.id && r.toProfileId === profile.id) ||
      (r.toUserId === currentUser.id && r.fromProfileId === profile.id)
  );
  const isAccepted = existingReq?.status === 'Accepted';
  const shouldBlur = profile.blurPhotoToNonMembers && !isActiveDopaMember;

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Life Partner', to: '/life-partner/' },
          { label: 'Browse', to: '/life-partner/browse/' },
          { label: profile.name },
        ]}
        eyebrow={`${profile.qualification} · ${profile.city}`}
        title={profile.name}
        actions={
          <Link to="/life-partner/browse/" className="dopa-btn sm ghost">
            <ArrowLeft className="w-4 h-4" /> Back to browse
          </Link>
        }
      />

      <section className="pb-12">
        <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 dopa-card flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--surface2)] grid place-items-center font-display font-bold text-2xl text-[var(--accent)] overflow-hidden">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                  />
                ) : (
                  profile.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((x) => x[0])
                    .join('')
                )}
              </div>
              <div>
                <div className="text-sm text-[var(--muted)]">
                  {profile.age} yrs · {profile.height} · {profile.maritalStatus}
                </div>
                <div className="font-semibold text-base mt-0.5">
                  {profile.profession} at {profile.workplace}
                </div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  Profile managed by: {profile.createdBy}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-1">About</h3>
              <p className="text-[var(--muted)]">{profile.about}</p>
            </div>
            <div>
              <h3 className="mb-1">Family background</h3>
              <p className="text-[var(--muted)]">{profile.familyDetails}</p>
            </div>
            {profile.religionSect && (
              <div>
                <h3 className="mb-1">Religion / Sect</h3>
                <p className="text-[var(--muted)]">{profile.religionSect}</p>
              </div>
            )}
            <div>
              <h3 className="mb-1">Partner expectations</h3>
              <p className="text-[var(--muted)]">{profile.expectations}</p>
            </div>
          </div>

          <aside className="lg:col-span-4 dopa-card flex flex-col gap-4">
            <h3>Contact &amp; Interest</h3>

            {isAccepted ? (
              <div className="p-4 rounded-xl bg-[var(--okbg)] text-sm flex flex-col gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[var(--ok)]">
                  <CheckCircle2 className="w-4 h-4" /> Request accepted — Contact visible
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {profile.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {profile.email}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[var(--surface2)] text-xs text-[var(--muted)] flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Hidden until request accepted</span>
              </div>
            )}

            {existingReq ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Request status:</span>
                  <StatusBadge status={existingReq.status} />
                </div>
                {existingReq.toUserId === currentUser.id && existingReq.status === 'Pending' && (
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => respondLpRequest(existingReq.id, 'Accepted')}
                      className="dopa-btn sm primary flex-1"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => respondLpRequest(existingReq.id, 'Declined')}
                      className="dopa-btn sm danger flex-1"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ) : currentLpProfile && currentLpProfile.id !== profile.id ? (
              <div className="flex flex-col gap-3">
                <textarea
                  rows={2}
                  className="dopa-input text-sm"
                  placeholder="Optional respectful introduction message..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => sendLpRequest(profile.id, note.trim() || undefined)}
                  className="dopa-btn primary w-full"
                >
                  Send interest request
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
};

/* ================= M13.6 REQUESTS PAGE (/life-partner/requests/) ================= */
export const LifePartnerRequestsPage: React.FC = () => {
  const { currentUser, lpProfiles, lpRequests, respondLpRequest } = useApp();
  const [tab, setTab] = useState<'received' | 'sent' | 'accepted'>('received');

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Interest Requests"
            message="Sign in to view received, sent, and accepted matrimonial requests."
            redirectTo="/life-partner/requests/"
          />
        </div>
      </div>
    );
  }

  const profileMap = new Map(lpProfiles.map((p) => [p.id, p]));
  const received = lpRequests.filter((r) => r.toUserId === currentUser.id);
  const sent = lpRequests.filter((r) => r.fromUserId === currentUser.id);
  const accepted = lpRequests.filter(
    (r) =>
      r.status === 'Accepted' &&
      (r.toUserId === currentUser.id || r.fromUserId === currentUser.id)
  );

  const activeList = tab === 'received' ? received : tab === 'sent' ? sent : accepted;

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Life Partner', to: '/life-partner/' },
          { label: 'Interest Requests' },
        ]}
        eyebrow="Matrimonial Inbox"
        title="Interest requests"
        actions={
          <Link to="/life-partner/browse/" className="dopa-btn sm primary">
            Browse profiles
          </Link>
        }
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'received' as const, label: `Received (${received.length})` },
              { id: 'sent' as const, label: `Sent (${sent.length})` },
              { id: 'accepted' as const, label: `Accepted (${accepted.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`dopa-btn sm ${tab === t.id ? 'primary' : 'ghost'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeList.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-6 h-6" />}
              title={`No ${tab} requests`}
              description="Interest requests sent or received will appear here."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeList.map((r) => {
                const otherProfile =
                  r.fromUserId === currentUser.id
                    ? profileMap.get(r.toProfileId)
                    : profileMap.get(r.fromProfileId);
                if (!otherProfile) return null;

                return (
                  <div key={r.id} className="dopa-card flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">
                          <Link
                            to={`/life-partner/${otherProfile.id}`}
                            className="text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                          >
                            {otherProfile.name}
                          </Link>
                        </h3>
                        <div className="text-xs text-[var(--muted)]">
                          {otherProfile.age} yrs · {otherProfile.qualification} · {otherProfile.city}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>

                    {r.message && (
                      <p className="text-sm text-[var(--muted)] italic">&ldquo;{r.message}&rdquo;</p>
                    )}

                    {r.status === 'Accepted' && (
                      <div className="p-3 rounded-xl bg-[var(--okbg)] text-xs flex flex-col gap-1">
                        <div>
                          <b>Phone:</b> {otherProfile.phone}
                        </div>
                        <div>
                          <b>Email:</b> {otherProfile.email}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--line)]">
                      <Link to={`/life-partner/${otherProfile.id}`} className="dopa-btn sm ghost">
                        View profile
                      </Link>
                      {r.toUserId === currentUser.id && r.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => respondLpRequest(r.id, 'Accepted')}
                            className="dopa-btn sm primary"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => respondLpRequest(r.id, 'Declined')}
                            className="dopa-btn sm danger"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
