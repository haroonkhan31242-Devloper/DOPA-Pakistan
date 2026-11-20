import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FlaskConical,
  LayoutDashboard,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PAKISTAN_CITIES, RM_CATEGORIES, RM_GRADES } from '../data/seedData';
import type { OrderStatus, RawMaterial, RmCategory, RmGrade, RmOrder } from '../types';
import {
  AuthGate,
  BankDetailsBox,
  ConfirmDialog,
  EmptyState,
  FileUpload,
  Modal,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { formatDateShort, formatPKR } from '../lib/formatters';

/* ================= M11.1 RAW MATERIALS DIRECTORY (/raw-materials/) ================= */
export const RawMaterialsPage: React.FC = () => {
  const { rawMaterials, sellers, isApprovedSeller } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [grade, setGrade] = useState('All');
  const [city, setCity] = useState('All');

  const sellerMap = useMemo(() => {
    const map = new Map(sellers.map((s) => [s.id, s]));
    return map;
  }, [sellers]);

  const approvedActive = useMemo(() => {
    return rawMaterials.filter((m) => {
      const s = sellerMap.get(m.sellerId);
      return m.active && s?.status === 'Approved';
    });
  }, [rawMaterials, sellerMap]);

  const cities = useMemo(
    () => Array.from(new Set(approvedActive.map((m) => m.city))).sort(),
    [approvedActive]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return approvedActive.filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (grade !== 'All' && m.grade !== grade) return false;
      if (city !== 'All' && m.city !== city) return false;
      if (q) {
        const s = sellerMap.get(m.sellerId);
        const hay = `${m.name} ${m.casNo} ${m.category} ${m.grade} ${m.description} ${s?.businessName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [approvedActive, category, grade, city, query, sellerMap]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Raw Materials' }]}
        eyebrow="B2B Marketplace"
        title="Pharmaceutical Raw Materials"
        intro="Source verified APIs, excipients, solvents, capsule shells, packaging, and lab chemicals directly from approved Pakistani suppliers."
        actions={
          <>
            {isApprovedSeller ? (
              <Link to="/seller-dashboard/" className="dopa-btn primary">
                Seller dashboard
              </Link>
            ) : (
              <Link to="/sell-raw-materials/" className="dopa-btn primary">
                Become a seller
              </Link>
            )}
          </>
        }
      />

      <section className="pb-10">
        <div className="wrap flex flex-col gap-6">
          {/* Filters */}
          <div className="dopa-card flat grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, CAS no., supplier..."
                className="dopa-input pl-10"
                aria-label="Search raw materials"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="dopa-input"
              aria-label="Filter by category"
            >
              <option value="All">All categories</option>
              {RM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="dopa-input"
              aria-label="Filter by grade"
            >
              <option value="All">All grades</option>
              {RM_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="dopa-input"
              aria-label="Filter by city"
            >
              <option value="All">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<FlaskConical className="w-6 h-6" />}
              title="No raw materials match those filters"
              description="Try clearing a category, grade, or city filter to browse all approved listings."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory('All');
                    setGrade('All');
                    setCity('All');
                  }}
                  className="dopa-btn sm ghost"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((mat) => {
                const seller = sellerMap.get(mat.sellerId);
                return (
                  <article key={mat.id} className="dopa-card flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--surface2)] text-[var(--accent)]">
                          {mat.grade}
                        </span>
                        <span className="font-mono-dopa text-xs text-[var(--muted)]">
                          CAS {mat.casNo || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs text-[var(--muted)] mb-1">{mat.category}</div>
                        <h3 className="text-lg font-bold leading-snug">
                          <Link
                            to={`/raw-materials/${mat.slug}/`}
                            className="text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                          >
                            {mat.name}
                          </Link>
                        </h3>
                      </div>

                      <p className="text-sm text-[var(--muted)] line-clamp-2">{mat.description}</p>

                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--surface2)] text-xs">
                        <div>
                          <span className="block text-[var(--muted)]">Unit price</span>
                          <span className="font-bold text-sm text-[var(--fg)] num">
                            {formatPKR(mat.pricePerUnit)} / {mat.unit}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[var(--muted)]">Min order / Stock</span>
                          <span className="font-semibold text-[var(--fg)] num">
                            {mat.minOrder} {mat.unit} · {mat.stock} avail.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                      <div className="min-w-0 text-xs">
                        <div className="font-semibold truncate">{seller?.businessName}</div>
                        <div className="text-[var(--muted)] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {mat.city}
                        </div>
                      </div>
                      <Link to={`/raw-materials/${mat.slug}/`} className="dopa-btn sm primary shrink-0">
                        View &amp; Order
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* How it works */}
          <div className="mt-6">
            <h2 className="mb-4">How raw material ordering works</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  step: '01',
                  title: 'Browse verified listings',
                  desc: 'Filter APIs, excipients, solvents, and lab reagents by pharmacopeial grade, CAS number, and city.',
                },
                {
                  step: '02',
                  title: 'Transfer directly to supplier',
                  desc: 'Pay the supplier’s verified bank account and upload your transfer reference or receipt on the listing page.',
                },
                {
                  step: '03',
                  title: 'Track dispatch in your account',
                  desc: 'The supplier confirms payment, dispatches the batch with COA documentation, and updates your order status.',
                },
              ].map((s) => (
                <div key={s.step} className="dopa-card flat">
                  <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                    STEP {s.step}
                  </span>
                  <h3 className="mt-1 mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M11.2 RAW MATERIAL DETAIL + ORDER (/raw-materials/:slug/) ================= */
export const MaterialDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { rawMaterials, sellers, currentUser, placeRmOrder, pushToast } = useApp();
  const navigate = useNavigate();

  const material = rawMaterials.find((m) => m.slug === slug);
  const seller = material ? sellers.find((s) => s.id === material.sellerId) : undefined;

  const [qty, setQty] = useState<number>(material?.minOrder || 1);
  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerCity, setBuyerCity] = useState(currentUser?.city || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptData, setReceiptData] = useState('');

  if (!material || !seller) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<FlaskConical className="w-6 h-6" />}
            title="Raw material listing not found"
            description="This material may have been removed or deactivated by the supplier."
            action={
              <Link to="/raw-materials/" className="dopa-btn primary">
                Back to raw materials
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const safeQty = Math.max(material.minOrder, Math.min(material.stock, qty));
  const total = safeQty * material.pricePerUnit;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate(`/login/?redirect=${encodeURIComponent(`/raw-materials/${material.slug}/`)}`);
      return;
    }
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerCity.trim() || !deliveryAddress.trim()) {
      pushToast('Please complete all required delivery details.', 'bad');
      return;
    }
    if (!confirmed || !paymentRef.trim()) {
      pushToast('Please confirm bank payment and enter your transfer reference.', 'bad');
      return;
    }
    placeRmOrder({
      buyerId: currentUser.id,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerCity: buyerCity.trim(),
      deliveryAddress: deliveryAddress.trim(),
      notes: notes.trim() || undefined,
      sellerId: seller.id,
      sellerName: seller.businessName,
      materialId: material.id,
      materialName: material.name,
      unit: material.unit,
      quantity: safeQty,
      pricePerUnit: material.pricePerUnit,
      total,
      paymentRef: paymentRef.trim(),
      receiptFileName: receiptName || undefined,
      receiptFileData: receiptData || undefined,
    });
    navigate('/account/rm-orders/');
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Raw Materials', to: '/raw-materials/' },
          { label: material.name },
        ]}
        eyebrow={`${material.category} · ${material.grade}`}
        title={material.name}
        actions={
          <Link to="/raw-materials/" className="dopa-btn sm ghost">
            <ArrowLeft className="w-4 h-4" /> All materials
          </Link>
        }
      />

      <section className="pb-12">
        <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Specs */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="dopa-card flex flex-col gap-4">
              <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--surface2)]">
                <div>
                  <div className="text-xs text-[var(--muted)]">Unit Price</div>
                  <div className="font-bold text-lg text-[var(--accent)] num">
                    {formatPKR(material.pricePerUnit)} / {material.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Minimum Order</div>
                  <div className="font-bold text-lg num">
                    {material.minOrder} {material.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Available Stock</div>
                  <div className="font-bold text-lg num">
                    {material.stock} {material.unit}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--muted)] block text-xs">CAS Number</span>
                  <span className="font-mono-dopa font-semibold">{material.casNo || 'Not listed'}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block text-xs">Pharmacopeial Grade</span>
                  <span className="font-semibold">{material.grade}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block text-xs">Category</span>
                  <span className="font-semibold">{material.category}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block text-xs">Dispatch City</span>
                  <span className="font-semibold">{material.city}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-1.5">Technical description &amp; batch notes</h3>
                <p className="text-[var(--muted)] leading-relaxed">{material.description}</p>
              </div>
            </div>

            <div className="dopa-card flat">
              <div className="eyebrow mb-1">Verified Supplier</div>
              <h3 className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--accent)]" /> {seller.businessName}
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Contact: {seller.contactPerson} · {seller.phone}
              </p>
              <p className="text-sm text-[var(--muted)]">
                Address: {seller.address}, {seller.city}
              </p>
              {seller.ntnOrLicence && (
                <p className="text-xs font-mono-dopa text-[var(--muted)] mt-1">
                  NTN / Drug Licence: {seller.ntnOrLicence}
                </p>
              )}
            </div>
          </div>

          {/* Right Order Form */}
          <div className="lg:col-span-5">
            {!currentUser ? (
              <AuthGate
                title="Sign in to place B2B order"
                message="Sign in with your Pharm.D or buyer account to place raw material orders and track supplier dispatch."
              />
            ) : (
              <form onSubmit={handlePlaceOrder} className="dopa-card flex flex-col gap-4">
                <div>
                  <h3>Place bulk order</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Minimum order quantity: {material.minOrder} {material.unit}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rmQty" className="text-sm font-semibold">
                      Quantity ({material.unit}) *
                    </label>
                    <input
                      id="rmQty"
                      type="number"
                      min={material.minOrder}
                      max={material.stock}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value) || material.minOrder)}
                      className="dopa-input"
                      required
                    />
                  </div>
                  <div className="flex flex-col justify-end p-3 rounded-xl bg-[var(--surface2)]">
                    <span className="text-xs text-[var(--muted)]">Order total</span>
                    <span className="font-bold text-lg text-[var(--accent)] num">
                      {formatPKR(total)}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rmBuyerName" className="text-sm font-semibold">
                      Buyer / Company name *
                    </label>
                    <input
                      id="rmBuyerName"
                      type="text"
                      className="dopa-input"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="rmBuyerPhone" className="text-sm font-semibold">
                      Phone *
                    </label>
                    <input
                      id="rmBuyerPhone"
                      type="tel"
                      className="dopa-input"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="rmBuyerCity" className="text-sm font-semibold">
                    City *
                  </label>
                  <input
                    id="rmBuyerCity"
                    type="text"
                    className="dopa-input"
                    value={buyerCity}
                    onChange={(e) => setBuyerCity(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="rmAddress" className="text-sm font-semibold">
                    Delivery / Factory address *
                  </label>
                  <textarea
                    id="rmAddress"
                    rows={2}
                    className="dopa-input"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="rmNotes" className="text-sm font-semibold">
                    COA / packaging instructions (optional)
                  </label>
                  <input
                    id="rmNotes"
                    type="text"
                    className="dopa-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Include batch COA with dispatch"
                  />
                </div>

                <BankDetailsBox
                  bank={seller.bankDetails}
                  amount={total}
                  remarkInstruction={`Include "${material.name}" in bank transfer remark.`}
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

                <button type="submit" className="dopa-btn primary w-full">
                  Submit raw material order
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================= M11.3 SELL RAW MATERIALS (/sell-raw-materials/) ================= */
export const SellRawMaterialsPage: React.FC = () => {
  const { currentUser, currentSeller, isApprovedSeller, applyRmSeller, pushToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const showApplyForm = searchParams.get('apply') === '1';

  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Lahore');
  const [address, setAddress] = useState('');
  const [ntnOrLicence, setNtnOrLicence] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [docName, setDocName] = useState('');
  const [docData, setDocData] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!businessName.trim() || !contactPerson.trim() || !phone.trim() || !address.trim()) {
      pushToast('Please fill in all required business fields.', 'bad');
      return;
    }
    if (!accountTitle.trim() || !bankName.trim() || !iban.trim() || !accountNumber.trim()) {
      pushToast('Please enter complete bank account details for payouts.', 'bad');
      return;
    }
    if (!agree) {
      pushToast('Please accept the supplier terms.', 'bad');
      return;
    }
    applyRmSeller({
      userId: currentUser.id,
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      ntnOrLicence: ntnOrLicence.trim() || undefined,
      bankDetails: {
        accountTitle: accountTitle.trim(),
        bankName: bankName.trim(),
        branchCity: city.trim(),
        iban: iban.trim(),
        accountNumber: accountNumber.trim(),
      },
      documentFileName: docName || undefined,
      documentFileData: docData || undefined,
    });
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Raw Materials', to: '/raw-materials/' },
          { label: 'Sell Raw Materials' },
        ]}
        eyebrow="Supplier Onboarding"
        title="Sell Pharmaceutical Raw Materials"
        intro="Connect your chemical, API, excipient, or packaging business with licensed manufacturers, compounding labs, and universities across Pakistan."
      />

      <section className="pb-12">
        <div className="wrap flex flex-col gap-6">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Direct B2B inquiries',
                desc: 'Publish CAS numbers, grades (BP/USP/EP), minimum orders, and live stock without middlemen.',
              },
              {
                title: 'Direct bank settlements',
                desc: 'Buyers transfer straight to your business bank account and attach their transaction reference.',
              },
              {
                title: 'Verified supplier badge',
                desc: 'Once admin reviews your business details, your supplier badge appears across all listings.',
              },
            ].map((b) => (
              <div key={b.title} className="dopa-card flat">
                <h3 className="mb-1.5">{b.title}</h3>
                <p className="text-sm text-[var(--muted)]">{b.desc}</p>
              </div>
            ))}
          </div>

          {!currentUser ? (
            <AuthGate
              title="Sign in to apply as a seller"
              message="Create a free account or sign in to submit your raw material supplier application."
              redirectTo="/sell-raw-materials/?apply=1"
            />
          ) : isApprovedSeller ? (
            <div className="dopa-card flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status="Approved" />
                  <span className="font-bold">{currentSeller?.businessName}</span>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Your supplier account is active. Add listings and manage bulk orders in your dashboard.
                </p>
              </div>
              <Link to="/seller-dashboard/" className="dopa-btn primary">
                Open Seller Dashboard
              </Link>
            </div>
          ) : currentSeller && currentSeller.status === 'Pending' ? (
            <div className="dopa-card max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status="Pending" />
                <span className="font-bold">{currentSeller.businessName}</span>
              </div>
              <h3 className="mb-1">Application under admin review</h3>
              <p className="text-sm text-[var(--muted)]">
                Submitted on {formatDateShort(currentSeller.submittedAt)}. You will receive an in-app notification once your supplier account is approved.
              </p>
            </div>
          ) : !showApplyForm ? (
            <div className="dopa-card flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3>Ready to list your raw materials?</h3>
                <p className="text-sm text-[var(--muted)]">
                  Complete the short business and bank verification form to open your Seller Dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchParams({ apply: '1' })}
                className="dopa-btn primary"
              >
                Apply as a supplier
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="dopa-card max-w-3xl flex flex-col gap-5">
              <div>
                <h2>Supplier application</h2>
                <p className="text-sm text-[var(--muted)]">
                  Enter your business, licence/NTN, and bank details for buyer transfers.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="sBiz" className="text-sm font-semibold">
                    Business / Company name *
                  </label>
                  <input
                    id="sBiz"
                    type="text"
                    className="dopa-input"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="sPerson" className="text-sm font-semibold">
                    Contact person *
                  </label>
                  <input
                    id="sPerson"
                    type="text"
                    className="dopa-input"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="sPhone" className="text-sm font-semibold">
                    Phone *
                  </label>
                  <input
                    id="sPhone"
                    type="tel"
                    className="dopa-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="sCity" className="text-sm font-semibold">
                    City *
                  </label>
                  <select
                    id="sCity"
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

              <div className="flex flex-col gap-1">
                <label htmlFor="sAddr" className="text-sm font-semibold">
                  Warehouse / Office address *
                </label>
                <input
                  id="sAddr"
                  type="text"
                  className="dopa-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="sNtn" className="text-sm font-semibold">
                  NTN or Drug / Chemical Licence No. (optional)
                </label>
                <input
                  id="sNtn"
                  type="text"
                  className="dopa-input"
                  value={ntnOrLicence}
                  onChange={(e) => setNtnOrLicence(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-[var(--line)]">
                <h3 className="mb-3">Bank details (shown to buyers at checkout)</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sbTitle" className="text-sm font-semibold">
                      Account title *
                    </label>
                    <input
                      id="sbTitle"
                      type="text"
                      className="dopa-input"
                      value={accountTitle}
                      onChange={(e) => setAccountTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sbBank" className="text-sm font-semibold">
                      Bank name *
                    </label>
                    <input
                      id="sbBank"
                      type="text"
                      className="dopa-input"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sbIban" className="text-sm font-semibold">
                      IBAN *
                    </label>
                    <input
                      id="sbIban"
                      type="text"
                      className="dopa-input"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sbAcct" className="text-sm font-semibold">
                      Account number *
                    </label>
                    <input
                      id="sbAcct"
                      type="text"
                      className="dopa-input"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <FileUpload
                id="rmSellerDoc"
                label="Business registration / licence scan (optional)"
                fileName={docName}
                fileData={docData}
                onFileSelect={(n, d) => {
                  setDocName(n);
                  setDocData(d);
                }}
                onClear={() => {
                  setDocName('');
                  setDocData('');
                }}
              />

              <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I confirm the materials listed comply with Pakistani pharmaceutical &amp; chemical supply regulations.
                </span>
              </label>

              <button type="submit" className="dopa-btn primary">
                Submit supplier application
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M11.4 SELLER DASHBOARD (/seller-dashboard/*) ================= */
export const SellerDashboardPage: React.FC = () => {
  const {
    currentUser,
    currentSeller,
    rawMaterials,
    rmOrders,
    upsertRawMaterial,
    deleteRawMaterial,
    updateRmOrderStatus,
    pushToast,
  } = useApp();
  const location = useLocation();
  const [editing, setEditing] = useState<Partial<RawMaterial> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RawMaterial | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<RmOrder | null>(null);

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Seller Dashboard"
            message="Sign in with your Raw Materials Seller account (demo: bilal.chem@dopa.pk / Pharmacist123) to manage listings and B2B orders."
            redirectTo="/seller-dashboard/"
          />
        </div>
      </div>
    );
  }

  if (!currentSeller) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<FlaskConical className="w-6 h-6" />}
            title="No seller profile found"
            description="Apply to become a verified raw materials supplier to access the Seller Dashboard."
            action={
              <Link to="/sell-raw-materials/?apply=1" className="dopa-btn primary">
                Apply as a seller
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (currentSeller.status !== 'Approved') {
    return (
      <div className="py-12">
        <div className="wrap max-w-2xl">
          <div className="dopa-card flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={currentSeller.status} />
              <span className="font-bold">{currentSeller.businessName}</span>
            </div>
            <h2>
              {currentSeller.status === 'Pending'
                ? 'Your seller application is under review'
                : 'Your seller application was declined'}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {currentSeller.status === 'Pending'
                ? 'Once an administrator verifies your business & bank details, you can publish raw materials here.'
                : 'Please contact infodopa.pk@gmail.com or submit updated documentation.'}
            </p>
            <div>
              <Link to="/raw-materials/" className="dopa-btn sm ghost">
                Browse raw materials
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const path = location.pathname;
  const tab = path.includes('/orders')
    ? 'orders'
    : path.includes('/profile')
    ? 'profile'
    : path.includes('/listings')
    ? 'listings'
    : 'overview';

  const myListings = rawMaterials.filter((m) => m.sellerId === currentSeller.id);
  const myOrders = rmOrders.filter((o) => o.sellerId === currentSeller.id);

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name?.trim()) {
      pushToast('Material name is required.', 'bad');
      return;
    }
    upsertRawMaterial({
      id: editing.id,
      sellerId: currentSeller.id,
      name: editing.name.trim(),
      category: (editing.category as RmCategory) || RM_CATEGORIES[0],
      grade: (editing.grade as RmGrade) || RM_GRADES[0],
      casNo: editing.casNo?.trim() || '',
      description: editing.description?.trim() || '',
      unit: (editing.unit as 'kg' | 'L' | 'pcs') || 'kg',
      pricePerUnit: Number(editing.pricePerUnit) || 0,
      minOrder: Math.max(1, Number(editing.minOrder) || 1),
      stock: Math.max(0, Number(editing.stock) || 0),
      city: editing.city?.trim() || currentSeller.city,
      active: editing.active ?? true,
    });
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Raw Materials', to: '/raw-materials/' },
          { label: 'Seller Dashboard' },
        ]}
        eyebrow="Supplier Portal"
        title={currentSeller.businessName}
        actions={
          <button
            type="button"
            onClick={() =>
              setEditing({
                category: RM_CATEGORIES[0],
                grade: RM_GRADES[0],
                unit: 'kg',
                minOrder: 5,
                stock: 50,
                pricePerUnit: 1500,
                city: currentSeller.city,
                active: true,
              })
            }
            className="dopa-btn sm primary"
          >
            <Plus className="w-4 h-4" /> Add raw material
          </button>
        }
      />

      <section className="pb-12">
        <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 dopa-card flat p-3 flex flex-col gap-1">
            {[
              { to: '/seller-dashboard/', key: 'overview', label: 'Overview', icon: LayoutDashboard },
              { to: '/seller-dashboard/listings/', key: 'listings', label: `My listings (${myListings.length})`, icon: Package },
              { to: '/seller-dashboard/orders/', key: 'orders', label: `B2B orders (${myOrders.length})`, icon: ShoppingBag },
              { to: '/seller-dashboard/profile/', key: 'profile', label: 'Supplier profile & bank', icon: Building2 },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors ${
                    active
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--fg)] hover:bg-[var(--surface2)]'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {tab === 'overview' && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">Active Listings</div>
                    <div className="text-2xl font-bold mt-1 num">
                      {myListings.filter((m) => m.active).length}
                    </div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">Total Orders</div>
                    <div className="text-2xl font-bold mt-1 num">{myOrders.length}</div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">Awaiting Payment Check</div>
                    <div className="text-2xl font-bold mt-1 num text-[var(--warn)]">
                      {myOrders.filter((o) => o.status === 'Waiting for payment confirmation').length}
                    </div>
                  </div>
                </div>

                <div className="dopa-card flat flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3>Quick actions</h3>
                    <p className="text-sm text-[var(--muted)]">
                      Manage inventory, update prices, or confirm buyer bank transfers.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/seller-dashboard/listings/" className="dopa-btn sm ghost">
                      Manage listings
                    </Link>
                    <Link to="/seller-dashboard/orders/" className="dopa-btn sm primary">
                      Review orders
                    </Link>
                  </div>
                </div>
              </>
            )}

            {tab === 'listings' && (
              <div className="flex flex-col gap-4">
                {myListings.length === 0 ? (
                  <EmptyState
                    icon={<FlaskConical className="w-6 h-6" />}
                    title="No raw materials listed yet"
                    description="Add your first API, excipient, solvent, or packaging material."
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            category: RM_CATEGORIES[0],
                            grade: RM_GRADES[0],
                            unit: 'kg',
                            minOrder: 5,
                            stock: 50,
                            pricePerUnit: 1500,
                            city: currentSeller.city,
                            active: true,
                          })
                        }
                        className="dopa-btn primary"
                      >
                        Add listing
                      </button>
                    }
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {myListings.map((m) => (
                      <div key={m.id} className="dopa-card flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-[var(--accent)]">
                              {m.grade}
                            </span>
                            <StatusBadge status={m.active ? 'Live' : 'Hidden'} />
                          </div>
                          <h3 className="font-bold">{m.name}</h3>
                          <div className="text-xs text-[var(--muted)] mt-0.5">
                            {m.category} · CAS {m.casNo || 'N/A'}
                          </div>
                          <div className="text-sm font-semibold mt-2 num">
                            {formatPKR(m.pricePerUnit)} / {m.unit} · Stock: {m.stock} {m.unit}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--line)]">
                          <button
                            type="button"
                            onClick={() => setEditing(m)}
                            className="dopa-btn sm ghost"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              upsertRawMaterial({ ...m, active: !m.active })
                            }
                            className="dopa-btn sm ghost"
                          >
                            {m.active ? 'Hide' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(m)}
                            className="dopa-btn sm ghost text-[var(--bad)]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'orders' && (
              <div className="flex flex-col gap-4">
                {myOrders.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag className="w-6 h-6" />}
                    title="No B2B orders yet"
                    description="Orders placed on your raw material listings will appear here."
                  />
                ) : (
                  myOrders.map((o) => (
                    <div key={o.id} className="dopa-card flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                            {o.orderNumber}
                          </span>
                          <h3 className="text-base font-bold">
                            {o.materialName} ({o.quantity} {o.unit})
                          </h3>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2 text-xs text-[var(--muted)]">
                        <div>
                          <b className="text-[var(--fg)]">Buyer:</b> {o.buyerName} ({o.buyerPhone})
                        </div>
                        <div>
                          <b className="text-[var(--fg)]">Total:</b>{' '}
                          <span className="num">{formatPKR(o.total)}</span>
                        </div>
                        <div>
                          <b className="text-[var(--fg)]">Transfer Ref:</b>{' '}
                          <span className="font-mono-dopa">{o.paymentRef}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--line)]">
                        {(['Payment confirmed', 'Dispatched', 'Delivered', 'Cancelled'] as OrderStatus[]).map(
                          (st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateRmOrderStatus(o.id, st)}
                              disabled={o.status === st}
                              className={`dopa-btn sm ${
                                o.status === st ? 'primary' : 'ghost'
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="dopa-btn sm ghost ml-auto"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div className="dopa-card flex flex-col gap-4">
                <h3>Supplier business &amp; payout details</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Business Name</span>
                    <span className="font-semibold">{currentSeller.businessName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Contact Person</span>
                    <span className="font-semibold">{currentSeller.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Phone &amp; City</span>
                    <span className="font-semibold">
                      {currentSeller.phone} · {currentSeller.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted)] block">NTN / Licence</span>
                    <span className="font-mono-dopa">{currentSeller.ntnOrLicence || '—'}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface2)] text-sm">
                  <div className="font-semibold mb-1">Bank Account</div>
                  <div>
                    {currentSeller.bankDetails.accountTitle} — {currentSeller.bankDetails.bankName}
                  </div>
                  <div className="font-mono-dopa text-xs mt-1">
                    IBAN: {currentSeller.bankDetails.iban} · Acct: {currentSeller.bankDetails.accountNumber}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit/Add Material Modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit raw material' : 'Add raw material'}
      >
        {editing && (
          <form onSubmit={handleSaveListing} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Material name *</label>
              <input
                type="text"
                className="dopa-input"
                value={editing.name || ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Category</label>
                <select
                  className="dopa-input"
                  value={editing.category || RM_CATEGORIES[0]}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as RmCategory })}
                >
                  {RM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Grade</label>
                <select
                  className="dopa-input"
                  value={editing.grade || RM_GRADES[0]}
                  onChange={(e) => setEditing({ ...editing, grade: e.target.value as RmGrade })}
                >
                  {RM_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">CAS Number</label>
                <input
                  type="text"
                  className="dopa-input"
                  value={editing.casNo || ''}
                  onChange={(e) => setEditing({ ...editing, casNo: e.target.value })}
                  placeholder="e.g. 103-90-2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Unit</label>
                <select
                  className="dopa-input"
                  value={editing.unit || 'kg'}
                  onChange={(e) =>
                    setEditing({ ...editing, unit: e.target.value as 'kg' | 'L' | 'pcs' })
                  }
                >
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Price / unit (PKR)</label>
                <input
                  type="number"
                  min={1}
                  className="dopa-input"
                  value={editing.pricePerUnit ?? 0}
                  onChange={(e) => setEditing({ ...editing, pricePerUnit: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Min order</label>
                <input
                  type="number"
                  min={1}
                  className="dopa-input"
                  value={editing.minOrder ?? 1}
                  onChange={(e) => setEditing({ ...editing, minOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Stock</label>
                <input
                  type="number"
                  min={0}
                  className="dopa-input"
                  value={editing.stock ?? 0}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Description &amp; COA details</label>
              <textarea
                rows={3}
                className="dopa-input"
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="dopa-btn sm ghost">
                Cancel
              </button>
              <button type="submit" className="dopa-btn sm primary">
                Save listing
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ''}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-3 text-sm">
            <StatusBadge status={selectedOrder.status} />
            <div>
              <b>Material:</b> {selectedOrder.materialName} — {selectedOrder.quantity}{' '}
              {selectedOrder.unit}
            </div>
            <div>
              <b>Total:</b> {formatPKR(selectedOrder.total)}
            </div>
            <div>
              <b>Delivery Address:</b> {selectedOrder.deliveryAddress}, {selectedOrder.buyerCity}
            </div>
            <div>
              <b>Payment Ref:</b> <span className="font-mono-dopa">{selectedOrder.paymentRef}</span>
            </div>
            {selectedOrder.notes && (
              <div>
                <b>Notes:</b> {selectedOrder.notes}
              </div>
            )}
            {selectedOrder.receiptFileData && (
              <div>
                <b className="block mb-1">Uploaded receipt:</b>
                <img
                  src={selectedOrder.receiptFileData}
                  alt={selectedOrder.receiptFileName || 'Receipt'}
                  className="max-h-48 rounded-xl border border-[var(--line)]"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete raw material listing?"
        message={`Remove "${deleteTarget?.name}" from the marketplace?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) deleteRawMaterial(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
