import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BankDetailsBox,
  EmptyState,
  FileUpload,
  HoneypotField,
  PageHeader,
  PasswordInput,
} from '../components/ui';
import { formatPKR, validateEmail, validatePassword } from '../lib/formatters';

/* ================= M8.1 PHARMACIES DIRECTORY (/pharmacies/) ================= */
export const PharmaciesPage: React.FC = () => {
  const { pharmacies } = useApp();
  const [kw, setKw] = useState('');
  const [city, setCity] = useState('All');
  const [appliedKw, setAppliedKw] = useState('');
  const [appliedCity, setAppliedCity] = useState('All');

  const approved = useMemo(
    () => pharmacies.filter((p) => p.status === 'Approved'),
    [pharmacies]
  );

  const cities = useMemo(
    () => Array.from(new Set(approved.map((p) => p.city))).sort(),
    [approved]
  );

  const filtered = useMemo(() => {
    return approved.filter((p) => {
      if (appliedCity !== 'All' && p.city !== appliedCity) return false;
      if (appliedKw.trim()) {
        const s = appliedKw.toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          p.city.toLowerCase().includes(s) ||
          (p.area || '').toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [approved, appliedKw, appliedCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKw(kw);
    setAppliedCity(city);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Pharmacies' }]}
        eyebrow="Pharmacies"
        title="Shop from verified pharmacies"
        intro="Every pharmacy here is approved by the admin after checking its licence. You pay the pharmacy directly by bank transfer."
      />

      <section className="pb-14">
        <div className="wrap flex flex-col gap-6">
          <form
            onSubmit={handleSearch}
            className="dopa-card flat grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ph-kw" className="text-xs font-semibold">
                Search
              </label>
              <input
                id="ph-kw"
                type="search"
                className="dopa-input"
                placeholder="Pharmacy name or area..."
                value={kw}
                onChange={(e) => setKw(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ph-city" className="text-xs font-semibold">
                City
              </label>
              <select
                id="ph-city"
                className="dopa-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="All">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="dopa-btn primary">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-6 h-6" />}
              title="No pharmacies match those filters"
              action={
                <button
                  type="button"
                  onClick={() => {
                    setKw('');
                    setCity('All');
                    setAppliedKw('');
                    setAppliedCity('All');
                  }}
                  className="dopa-btn sm primary"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((ph) => (
                <Link
                  key={ph.id}
                  to={`/pharmacy/?shop=${encodeURIComponent(ph.slug)}`}
                  className="dopa-card hov no-underline text-[var(--fg)] flex items-start gap-4"
                >
                  {ph.logo ? (
                    <img
                      src={ph.logo}
                      alt={ph.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[var(--line)] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface2)] text-[var(--accent)] font-display font-bold text-2xl grid place-items-center border border-[var(--line)] shrink-0">
                      {ph.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold truncate">{ph.name}</h3>
                      <ShieldCheck className="w-4 h-4 text-[var(--ok)] shrink-0" aria-label="Verified" />
                    </div>
                    <div className="text-sm text-[var(--muted)] mt-0.5">
                      {ph.area ? `${ph.area}, ` : ''}
                      {ph.city}
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-2 truncate">{ph.address}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="dopa-cta flex flex-wrap items-center justify-between gap-6 mt-4">
            <div className="relative z-10">
              <h2 className="text-white">Own a pharmacy?</h2>
              <p className="text-[#C8DDE6] text-sm mt-1">
                Apply to list your products. The admin checks your licence before you go live.
              </p>
            </div>
            <Link
              to="/pharmacy-register/"
              className="dopa-btn bg-[#83E5D2] text-[#06222B] hover:bg-[#A3F0E0] relative z-10"
            >
              Register your pharmacy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M8.2 SINGLE PHARMACY PROFILE (/pharmacy/?shop={slug}) ================= */
export const PharmacyProfilePage: React.FC = () => {
  const { pharmacies, products, addToCart } = useApp();
  const [searchParams] = useSearchParams();
  const shopSlug = searchParams.get('shop') || '';
  const [search, setSearch] = useState('');

  const pharmacy = pharmacies.find((p) => p.slug === shopSlug && p.status === 'Approved');

  if (!pharmacy) {
    return (
      <div className="py-14">
        <div className="wrap max-w-2xl">
          <EmptyState
            icon={<Building2 className="w-6 h-6" />}
            title="Pharmacy not found"
            description="This pharmacy link is invalid or awaiting admin approval."
            action={
              <Link to="/pharmacies/" className="dopa-btn sm primary">
                Browse registered pharmacies
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const shopProducts = products.filter((p) => {
    if (p.pharmacyId !== pharmacy.id || !p.active) return false;
    if (search.trim()) {
      return p.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Pharmacies', to: '/pharmacies/' },
          { label: pharmacy.name },
        ]}
        eyebrow={`Verified Pharmacy · ${pharmacy.city}`}
        title={pharmacy.name}
      />

      <section className="pb-14">
        <div className="wrap flex flex-col gap-8">
          <div className="dopa-card flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {pharmacy.logo ? (
                <img
                  src={pharmacy.logo}
                  alt={pharmacy.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-[var(--line)] shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[var(--surface2)] text-[var(--accent)] font-display font-bold text-3xl grid place-items-center border border-[var(--line)] shrink-0">
                  {pharmacy.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[var(--okbg)] text-[var(--ok)]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Licence verified
                  </span>
                  <span className="text-xs text-[var(--muted)] font-mono-dopa">
                    {pharmacy.licenceNo}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-1">
                  <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>
                    {pharmacy.address}
                    {pharmacy.area ? ` (${pharmacy.area})` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <a href={`tel:${pharmacy.phone.replace(/\s+/g, '')}`}>{pharmacy.phone}</a>
                </div>
              </div>
            </div>

            {pharmacy.mapsUrl && (
              <a
                href={pharmacy.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dopa-btn sm ghost"
              >
                <ExternalLink className="w-4 h-4" /> Open in Google Maps
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2>Products from {pharmacy.name}</h2>
            <input
              type="search"
              className="dopa-input sm:w-72"
              placeholder="Search pharmacy products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {shopProducts.length === 0 ? (
            <EmptyState
              title="No products match"
              description="Try clearing your search or send a medicine request directly."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {shopProducts.map((prod) => (
                <article key={prod.id} className="dopa-card hov flex flex-col gap-3 !p-4">
                  <Link to={`/product/${prod.slug}/`} className="block">
                    <img
                      src={prod.image || '/assets/uploads/prod-panadol.jpg'}
                      alt={prod.name}
                      className="w-full aspect-[4/3] object-cover rounded-xl bg-[var(--surface2)]"
                    />
                  </Link>
                  <div className="text-xs text-[var(--muted)]">{prod.category}</div>
                  <h3 className="text-base font-bold">
                    <Link to={`/product/${prod.slug}/`} className="text-[var(--fg)] no-underline hover:text-[var(--accent)]">
                      {prod.name}
                    </Link>
                  </h3>
                  <div className="font-bold text-lg num flex-1">{formatPKR(prod.price)}</div>
                  <button
                    type="button"
                    onClick={() => addToCart(prod.id, 1)}
                    className="dopa-btn sm primary w-full"
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M8.3 REGISTER YOUR PHARMACY (/pharmacy-register/) ================= */
export const PharmacyRegisterPage: React.FC = () => {
  const { settings, registerPharmacy } = useApp();
  const [step, setStep] = useState(1);
  const [honeypot, setHoneypot] = useState('');

  // Step 1: Pharmacist
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Pharmacy
  const [pharmacyName, setPharmacyName] = useState('');
  const [licenceNo, setLicenceNo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [licenceFileName, setLicenceFileName] = useState('');
  const [licenceFileData, setLicenceFileData] = useState('');
  const [logoData, setLogoData] = useState('');
  const [logoName, setLogoName] = useState('');

  // Step 3: Payment
  const [confirmedPay, setConfirmedPay] = useState(false);
  const [paidRef, setPaidRef] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptData, setReceiptData] = useState('');

  // Step 4: Confirm
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const validateStep = (s: number): boolean => {
    setError(null);
    if (s === 1) {
      if (!ownerName.trim()) {
        setError('Pharmacist full name is required.');
        return false;
      }
      if (!phone.trim()) {
        setError('Phone number is required.');
        return false;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return false;
      }
      const pwErr = validatePassword(password);
      if (pwErr) {
        setError(pwErr);
        return false;
      }
    }
    if (s === 2) {
      if (!pharmacyName.trim()) {
        setError('Pharmacy name is required.');
        return false;
      }
      if (!licenceNo.trim()) {
        setError('Pharmacy licence / registration number is required.');
        return false;
      }
      if (!address.trim() || !city.trim()) {
        setError('Full address and city are required.');
        return false;
      }
      if (!licenceFileName) {
        setError('Please upload your pharmacy licence or certificate.');
        return false;
      }
    }
    if (s === 3) {
      if (!confirmedPay || !paidRef.trim()) {
        setError('Please press "Confirm payment" and enter your transfer reference.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== '') return;
    if (!confirmTerms) {
      setError('Please confirm your details are true and accept the terms and privacy policy.');
      return;
    }
    const res = registerPharmacy({
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      name: pharmacyName.trim(),
      licenceNo: licenceNo.trim(),
      address: address.trim(),
      city: city.trim(),
      area: area.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      licenceFileName,
      licenceFileData,
      logo: logoData || undefined,
      paidRef: paidRef.trim(),
      receiptFileName: receiptName || undefined,
      receiptFileData: receiptData || undefined,
      bankDetails: {
        accountTitle: `${pharmacyName.trim()} Pharmacy`,
        bankName: 'Bank Transfer (Update in Pharmacy Dashboard)',
        iban: 'PK00BANK0000000000000000',
        accountNumber: '00000000000000',
      },
    });
    if (!res.ok) {
      setError(res.error || 'Could not register pharmacy.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Pharmacies', to: '/pharmacies/' },
          { label: 'Register your pharmacy' },
        ]}
        eyebrow="Pharmacies"
        title="Register your pharmacy"
        intro="List your products for customers across Pakistan. This is a separate account from DOPA membership."
      />

      <section className="pb-14">
        <div className="wrap max-w-3xl">
          {submitted ? (
            <div className="dopa-card py-10 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--okbg)] text-[var(--ok)] grid place-items-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2>Submitted — your pharmacy goes live after the admin checks your licence.</h2>
              <p className="text-sm text-[var(--muted)]">
                You can sign in now with <b>{email}</b> on the Sign in page (Pharmacy Account tab) to view your pending dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/login/" className="dopa-btn primary">
                  Log in to Pharmacy Dashboard
                </Link>
                <Link to="/pharmacies/" className="dopa-btn ghost">
                  View verified pharmacies
                </Link>
              </div>
            </div>
          ) : (
            <div className="dopa-card">
              {/* Stepper header */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {['1. Pharmacist', '2. Pharmacy', '3. Payment', '4. Confirm'].map((label, idx) => {
                  const s = idx + 1;
                  const active = step === s;
                  const done = step > s;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => s < step && setStep(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center cursor-pointer transition-colors ${
                        active
                          ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                          : done
                          ? 'bg-[var(--okbg)] text-[var(--ok)] border-transparent'
                          : 'bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                {step === 1 && (
                  <div className="flex flex-col gap-4">
                    <h2>Pharmacist details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pr-owner" className="text-sm font-semibold">
                          Pharmacist full name <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          id="pr-owner"
                          type="text"
                          className="dopa-input"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pr-phone" className="text-sm font-semibold">
                          Phone <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          id="pr-phone"
                          type="tel"
                          className="dopa-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="pr-email" className="text-sm font-semibold">
                        Email (used to log in) <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="pr-email"
                        type="email"
                        className="dopa-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <PasswordInput
                      id="pr-pw"
                      label="Password"
                      value={password}
                      onChange={setPassword}
                      required
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-4">
                    <h2>Pharmacy details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pr-pname" className="text-sm font-semibold">
                          Pharmacy name <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          id="pr-pname"
                          type="text"
                          className="dopa-input"
                          value={pharmacyName}
                          onChange={(e) => setPharmacyName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pr-lic" className="text-sm font-semibold">
                          Pharmacy licence / registration number <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          id="pr-lic"
                          type="text"
                          className="dopa-input"
                          value={licenceNo}
                          onChange={(e) => setLicenceNo(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="pr-addr" className="text-sm font-semibold">
                        Full address <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        id="pr-addr"
                        type="text"
                        className="dopa-input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pr-city" className="text-sm font-semibold">
                          City <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          id="pr-city"
                          type="text"
                          className="dopa-input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pr-area" className="text-sm font-semibold">
                          Area / locality (optional)
                        </label>
                        <input
                          id="pr-area"
                          type="text"
                          className="dopa-input"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="pr-maps" className="text-sm font-semibold">
                        Google Maps link (optional)
                      </label>
                      <input
                        id="pr-maps"
                        type="url"
                        className="dopa-input"
                        placeholder="https://maps.google.com/..."
                        value={mapsUrl}
                        onChange={(e) => setMapsUrl(e.target.value)}
                      />
                      <span className="text-xs text-[var(--muted)]">
                        Open your shop in Google Maps, press Share, and paste the link.
                      </span>
                    </div>
                    <FileUpload
                      id="pr-licfile"
                      label="Licence or certificate (photo or PDF)"
                      hint="JPG, PNG, WebP or PDF up to 5 MB. Only the admin can see it."
                      fileName={licenceFileName}
                      fileData={licenceFileData}
                      onFileSelect={(n, d) => {
                        setLicenceFileName(n);
                        setLicenceFileData(d);
                      }}
                      onClear={() => {
                        setLicenceFileName('');
                        setLicenceFileData('');
                      }}
                      required
                    />
                    <FileUpload
                      id="pr-logo"
                      label="Pharmacy logo (optional)"
                      accept=".jpg,.jpeg,.png,.webp"
                      hint="JPG, PNG or WebP. Shown on your pharmacy page."
                      fileName={logoName}
                      fileData={logoData}
                      onFileSelect={(n, d) => {
                        setLogoName(n);
                        setLogoData(d);
                      }}
                      onClear={() => {
                        setLogoName('');
                        setLogoData('');
                      }}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-4">
                    <h2>Annual membership &amp; payment</h2>
                    <div className="dopa-card flat bg-[var(--navy)] text-[#E8F3F6] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="eyebrow">Annual pharmacy plan</div>
                        <div className="font-display font-extrabold text-3xl text-white mt-1 num">
                          {formatPKR(settings.pharmacyFee)} / 12 months
                        </div>
                        <div className="text-xs text-[#A9BFCC] mt-1">
                          Separate from DOPA member plans.
                        </div>
                      </div>
                    </div>

                    <BankDetailsBox
                      bank={settings.pharmacyBank}
                      amount={settings.pharmacyFee}
                      remarkInstruction={`Pharmacy membership - ${pharmacyName || '<your pharmacy name>'}`}
                      confirmed={confirmedPay}
                      onToggleConfirm={() => setConfirmedPay(true)}
                      paymentRef={paidRef}
                      onPaymentRefChange={setPaidRef}
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
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col gap-4">
                    <h2>Review &amp; submit for approval</h2>
                    <div className="p-4 rounded-xl bg-[var(--surface2)] text-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-[var(--muted)] block">Pharmacist</span>
                        <b>{ownerName}</b> ({phone})
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted)] block">Login email</span>
                        <b>{email}</b>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted)] block">Pharmacy</span>
                        <b>{pharmacyName}</b> &middot; {city}
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted)] block">Licence / Payment ref</span>
                        <b>{licenceNo}</b> &middot; <span className="font-mono-dopa">{paidRef}</span>
                      </div>
                    </div>
                    <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmTerms}
                        onChange={(e) => setConfirmTerms(e.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        I confirm the details are true and accept the{' '}
                        <Link to="/terms/">terms</Link> and <Link to="/privacy/">privacy policy</Link>.
                      </span>
                    </label>
                  </div>
                )}

                {error && <div className="dopa-notice bad text-sm">{error}</div>}

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep((s) => s - 1);
                      }}
                      className="dopa-btn ghost"
                    >
                      Previous
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">
                      Already applied? <Link to="/login/">Log in</Link>
                    </span>
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => validateStep(step) && setStep((s) => s + 1)}
                      className="dopa-btn primary"
                    >
                      Continue
                    </button>
                  ) : (
                    <button type="submit" className="dopa-btn primary">
                      Submit for approval
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
