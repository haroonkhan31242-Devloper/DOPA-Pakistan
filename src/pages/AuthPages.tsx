import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUALIFICATIONS } from '../data/seedData';
import type { Qualification } from '../types';
import { HoneypotField, PageHeader, PasswordInput } from '../components/ui';
import { validateEmail, validatePassword } from '../lib/formatters';

/* ================= M2.1 SIGN UP (/register/) ================= */
export const RegisterPage: React.FC = () => {
  const { currentUser, currentPharmacy, registerUser } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account/';

  const [honeypot, setHoneypot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState<Qualification | ''>('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentUser) return <Navigate to={redirect} replace />;
  if (currentPharmacy) return <Navigate to="/pharmacy-dashboard/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (honeypot.trim() !== '') return;
    if (!name.trim()) return setError('Full name is required.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (!qualification) return setError('Please select your qualification.');
    if (!city.trim()) return setError('City is required.');
    const pwErr = validatePassword(password);
    if (pwErr) return setError(pwErr);
    if (!terms) return setError('You must accept the terms and privacy policy.');

    const res = registerUser({
      name: name.trim(),
      email: email.trim(),
      qualification: qualification as Qualification,
      city: city.trim(),
      phone: phone.trim() || undefined,
      password,
    });

    if (!res.ok) {
      setError(res.error || 'Could not create account.');
      return;
    }
    navigate(redirect, { replace: true });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Sign up' }]}
        eyebrow="DOPA account"
        title="Sign up"
        intro="Create a free account for the job board, community, videos and shop."
      />

      <section className="pb-14">
        <div className="wrap max-w-xl">
          <div className="dopa-card">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <HoneypotField value={honeypot} onChange={setHoneypot} />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-name" className="text-sm font-semibold">
                  Full name <span className="text-[var(--bad)]">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="dopa-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="text-sm font-semibold">
                  Email <span className="text-[var(--bad)]">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="dopa-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-qual" className="text-sm font-semibold">
                    Qualification <span className="text-[var(--bad)]">*</span>
                  </label>
                  <select
                    id="reg-qual"
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

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-city" className="text-sm font-semibold">
                    City <span className="text-[var(--bad)]">*</span>
                  </label>
                  <input
                    id="reg-city"
                    type="text"
                    className="dopa-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-phone" className="text-sm font-semibold">
                  Phone (optional)
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="dopa-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              <PasswordInput
                id="reg-pw"
                label="Password"
                value={password}
                onChange={setPassword}
                required
              />

              <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I accept the{' '}
                  <Link to="/terms/" className="font-semibold">
                    terms
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy/" className="font-semibold">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>

              {error && <div className="dopa-notice bad text-sm">{error}</div>}

              <button type="submit" className="dopa-btn primary w-full mt-1">
                Create account
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--line)] flex flex-col gap-2 text-sm text-[var(--muted)]">
              <p>
                Already registered?{' '}
                <Link
                  to={`/login/${redirect !== '/account/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                  className="font-semibold"
                >
                  Log in
                </Link>
              </p>
              <p>
                Pharmacist or Pharm.D student?{' '}
                <Link to="/dopa-association/" className="font-semibold">
                  Join the DOPA Association
                </Link>{' '}
                instead.
              </p>
              <p>
                Pharmacy owner?{' '}
                <Link to="/pharmacy-register/" className="font-semibold">
                  Register your pharmacy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M2.2 SIGN IN (/login/) ================= */
export const LoginPage: React.FC = () => {
  const { currentUser, currentPharmacy, login } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [tab, setTab] = useState<'user' | 'pharmacy'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (currentUser) {
    return <Navigate to={redirectParam || (currentUser.role === 'admin' ? '/admin/' : '/account/')} replace />;
  }
  if (currentPharmacy) {
    return <Navigate to="/pharmacy-dashboard/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    const res = login(email, password, tab === 'pharmacy' ? 'pharmacy' : 'auto');
    if (!res.ok) {
      setError(res.error || 'Invalid credentials.');
      return;
    }
    if (res.kind === 'pharmacy') {
      navigate('/pharmacy-dashboard/', { replace: true });
    } else if (redirectParam) {
      navigate(redirectParam, { replace: true });
    } else {
      navigate(email.trim().toLowerCase() === 'admin@dopa.pk' ? '/admin/' : '/account/', { replace: true });
    }
  };

  const quickFill = (demoEmail: string, demoPw: string, kind: 'user' | 'pharmacy') => {
    setTab(kind);
    setEmail(demoEmail);
    setPassword(demoPw);
    setError(null);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Sign in' }]}
        eyebrow="DOPA account"
        title="Sign in"
        intro="Welcome back."
      />

      <section className="pb-14">
        <div className="wrap max-w-xl flex flex-col gap-6">
          <div className="dopa-card">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface2)] border border-[var(--line)] mb-5">
              <button
                type="button"
                onClick={() => setTab('user')}
                className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                  tab === 'user' ? 'bg-[var(--fg)] text-[var(--bg)]' : 'text-[var(--fg)]'
                }`}
              >
                Website &amp; DOPA Account
              </button>
              <button
                type="button"
                onClick={() => setTab('pharmacy')}
                className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                  tab === 'pharmacy' ? 'bg-[var(--fg)] text-[var(--bg)]' : 'text-[var(--fg)]'
                }`}
              >
                Pharmacy Account
              </button>
            </div>

            {tab === 'pharmacy' && (
              <div className="dopa-notice mb-4 text-xs">
                Pharmacy accounts use the email address and password submitted during pharmacy registration.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-sm font-semibold">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="dopa-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <PasswordInput
                id="login-pw"
                label="Password"
                value={password}
                onChange={setPassword}
                showStrengthHint={false}
                required
              />

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Keep me logged in on this device</span>
              </label>

              {error && <div className="dopa-notice bad text-sm">{error}</div>}

              <button type="submit" className="dopa-btn primary w-full">
                Sign in
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap justify-between gap-2 text-sm">
              <Link to="/forgot-password/" className="font-medium">
                Forgot password?
              </Link>
              <Link
                to={`/register/${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
                className="font-semibold"
              >
                Create account
              </Link>
            </div>
          </div>

          {/* Demo accounts switcher for frontend testing */}
          <div className="dopa-card flat bg-[var(--surface2)]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-mono-dopa uppercase tracking-wider text-[var(--accent)] font-semibold">
                Demo Simulation Credentials (Click to fill)
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Frontend-only LocalStorage simulation. Click any role below to fill email &amp; password, then press Sign in:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => quickFill('ali.raza@dopa.pk', 'Pharmacist123', 'user')}
                className="dopa-btn sm ghost"
              >
                DOPA Member (Dr. Ali)
              </button>
              <button
                type="button"
                onClick={() => quickFill('sara.khan@dopa.pk', 'Pharmacist123', 'user')}
                className="dopa-btn sm ghost"
              >
                Website User (Sara)
              </button>
              <button
                type="button"
                onClick={() => quickFill('alees@pharmacy.pk', 'Pharmacy1234', 'pharmacy')}
                className="dopa-btn sm ghost"
              >
                Pharmacy (Alees)
              </button>
              <button
                type="button"
                onClick={() => quickFill('bilal.chem@dopa.pk', 'Pharmacist123', 'user')}
                className="dopa-btn sm ghost"
              >
                RM Seller (Bilal)
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@dopa.pk', 'DopaAdmin2026', 'user')}
                className="dopa-btn sm ghost"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M2.3 FORGOT & RESET PASSWORD ================= */
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErr('Please enter a valid email address.');
      return;
    }
    setErr(null);
    setSent(true);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Forgot password' }]}
        eyebrow="DOPA account"
        title="Forgot password"
        intro="Enter the email address linked to your account and we will send reset instructions."
      />
      <section className="pb-14">
        <div className="wrap max-w-lg">
          <div className="dopa-card">
            {sent ? (
              <div className="flex flex-col gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[var(--okbg)] text-[var(--ok)] grid place-items-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3>Check your email</h3>
                <p className="text-sm text-[var(--muted)]">
                  If an account exists for <b>{email}</b>, a password reset link has been sent.
                </p>
                <div className="flex gap-2 mt-2">
                  <Link to="/reset-password/?token=demo-reset-token" className="dopa-btn sm primary">
                    Simulate Reset Link
                  </Link>
                  <Link to="/login/" className="dopa-btn sm ghost">
                    Back to Sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-email" className="text-sm font-semibold">
                    Email address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    className="dopa-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {err && <div className="dopa-notice bad text-sm">{err}</div>}
                <button type="submit" className="dopa-btn primary">
                  Send reset link
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const { pushToast } = useApp();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(pw);
    if (pwErr) return setErr(pwErr);
    if (pw !== confirm) return setErr('Passwords do not match.');
    pushToast('Password reset successfully. You can now sign in.');
    navigate('/login/');
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Reset password' }]}
        eyebrow="DOPA account"
        title="Reset password"
        intro="Choose a new password for your account."
      />
      <section className="pb-14">
        <div className="wrap max-w-lg">
          <div className="dopa-card">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <PasswordInput id="rp-pw" label="New password" value={pw} onChange={setPw} required />
              <PasswordInput
                id="rp-confirm"
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                showStrengthHint={false}
                required
              />
              {err && <div className="dopa-notice bad text-sm">{err}</div>}
              <button type="submit" className="dopa-btn primary">
                <KeyRound className="w-4 h-4" /> Update password
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
