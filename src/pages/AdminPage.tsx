import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Building2,
  FileText,
  FlaskConical,
  Heart,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Pill,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  Trash2,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Article, DopaMembership, Pharmacy } from '../types';
import {
  AuthGate,
  ConfirmDialog,
  EmptyState,
  MemberCard,
  Modal,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { formatDateShort, formatPKR } from '../lib/formatters';

/* ================= M17 ADMIN PANEL (/admin/*) ================= */
export const AdminPage: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    users,
    memberships,
    pharmacies,
    products,
    orders,
    medRequests,
    sellers,
    rawMaterials,
    rmOrders,
    jobs,
    lpProfiles,
    posts,
    videos,
    articles,
    faqs,
    universities,
    slides,
    messages,
    settings,
    adminReviewMembership,
    adminReviewPharmacy,
    upsertProduct,
    deleteProduct,
    adminReviewSeller,
    upsertRawMaterial,
    deleteRawMaterial,
    updateJob,
    deleteJob,
    adminReviewLpProfile,
    adminModeratePost,
    adminModerateVideo,
    upsertArticle,
    deleteArticle,
    upsertFaq,
    deleteFaq,
    upsertUniversity,
    deleteUniversity,
    setSlides,
    adminUpdateUser,
    markMessageRead,
    updateSettings,
    resetAllDemoData,
    pushToast,
  } = useApp();

  const location = useLocation();
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<DopaMembership | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewMember, setPreviewMember] = useState<DopaMembership | null>(null);
  const [inspectPharmacy, setInspectPharmacy] = useState<Pharmacy | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [msgFilter, setMsgFilter] = useState<'All' | 'Doctor of Pharmacy (Pharm.D)' | 'DOPA Association'>('All');
  const [confirmReset, setConfirmReset] = useState(false);

  // Content quick forms
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleCat, setNewArticleCat] = useState<'Articles' | 'News'>('Articles');
  const [newArticleExcerpt, setNewArticleExcerpt] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newUniName, setNewUniName] = useState('');
  const [newUniCity, setNewUniCity] = useState('Lahore');
  const [newUniSector, setNewUniSector] = useState<'Public' | 'Private'>('Public');

  // Settings local edits
  const [phFee, setPhFee] = useState(settings.pharmacyFee);
  const [lpFee, setLpFee] = useState(settings.lifePartnerFee);
  const [dopaEmail, setDopaEmail] = useState(settings.dopaEmail);
  const [pharmdPhone, setPharmdPhone] = useState(settings.pharmdPhone);

  const path = location.pathname;
  const tab = path.includes('/dopa-applications')
    ? 'dopa-applications'
    : path.includes('/members')
    ? 'members'
    : path.includes('/pharmacies')
    ? 'pharmacies'
    : path.includes('/products')
    ? 'products'
    : path.includes('/orders')
    ? 'orders'
    : path.includes('/medicine-requests')
    ? 'medicine-requests'
    : path.includes('/raw-materials')
    ? 'raw-materials'
    : path.includes('/jobs')
    ? 'jobs'
    : path.includes('/life-partner')
    ? 'life-partner'
    : path.includes('/community')
    ? 'community'
    : path.includes('/content')
    ? 'content'
    : path.includes('/users')
    ? 'users'
    : path.includes('/messages')
    ? 'messages'
    : path.includes('/settings')
    ? 'settings'
    : 'dashboard';

  const counts = useMemo(
    () => ({
      dopaPending: memberships.filter((m) => m.status === 'Pending').length,
      phPending: pharmacies.filter((p) => p.status === 'Pending').length,
      sellersPending: sellers.filter((s) => s.status === 'Pending').length,
      jobsPending: jobs.filter((j) => j.status === 'Pending').length,
      lpPending: lpProfiles.filter((p) => p.status === 'Pending' || p.paymentStatus === 'Pending').length,
      videosPending: videos.filter((v) => v.status === 'Pending').length,
      unreadMsgs: messages.filter((m) => !m.read).length,
    }),
    [memberships, pharmacies, sellers, jobs, lpProfiles, videos, messages]
  );

  if (!currentUser || !isAdmin) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="DOPA Admin Panel"
            message="Sign in with the Administrator account (demo: admin@dopa.pk / DopaAdmin2026) to manage approvals, listings, content, and settings."
            redirectTo="/admin/"
          />
        </div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();

  const navItems = [
    { to: '/admin/', key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/dopa-applications/', key: 'dopa-applications', label: `DOPA Applications (${counts.dopaPending})`, icon: Award },
    { to: '/admin/members/', key: 'members', label: 'DOPA Members', icon: Users },
    { to: '/admin/pharmacies/', key: 'pharmacies', label: `Pharmacies (${counts.phPending})`, icon: Building2 },
    { to: '/admin/products/', key: 'products', label: 'Products & Categories', icon: Package },
    { to: '/admin/orders/', key: 'orders', label: 'Orders Monitor', icon: ShoppingBag },
    { to: '/admin/medicine-requests/', key: 'medicine-requests', label: 'Medicine Requests', icon: Pill },
    { to: '/admin/raw-materials/', key: 'raw-materials', label: `Raw Materials (${counts.sellersPending})`, icon: FlaskConical },
    { to: '/admin/jobs/', key: 'jobs', label: `Jobs Queue (${counts.jobsPending})`, icon: Briefcase },
    { to: '/admin/life-partner/', key: 'life-partner', label: `Life Partner (${counts.lpPending})`, icon: Heart },
    { to: '/admin/community/', key: 'community', label: `Community & Videos (${counts.videosPending})`, icon: MessageSquare },
    { to: '/admin/content/', key: 'content', label: 'CMS Content', icon: FileText },
    { to: '/admin/users/', key: 'users', label: `Users (${users.length})`, icon: Users },
    { to: '/admin/messages/', key: 'messages', label: `Messages (${counts.unreadMsgs})`, icon: Mail },
    { to: '/admin/settings/', key: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Admin Panel' }]}
        eyebrow="Administration"
        title="DOPA Control Centre"
        actions={
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="dopa-btn sm ghost"
          >
            <RefreshCw className="w-4 h-4" /> Reset demo data
          </button>
        }
      />

      <section className="pb-12">
        <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3 dopa-card flat p-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium no-underline transition-colors ${
                    active
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--fg)] hover:bg-[var(--surface2)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" /> {item.label}
                </Link>
              );
            })}
          </aside>

          <div className="lg:col-span-9 flex flex-col gap-5">
            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                className="dopa-input pl-10"
                placeholder="Filter current queue by name, email, number, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {tab === 'dashboard' && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Pending DOPA Applications', val: counts.dopaPending, to: '/admin/dopa-applications/' },
                    { label: 'Pending Pharmacy Registrations', val: counts.phPending, to: '/admin/pharmacies/' },
                    { label: 'Pending RM Sellers', val: counts.sellersPending, to: '/admin/raw-materials/' },
                    { label: 'Pending Job Listings', val: counts.jobsPending, to: '/admin/jobs/' },
                    { label: 'Pending Life Partner Profiles', val: counts.lpPending, to: '/admin/life-partner/' },
                    { label: 'Unread Inbox Messages', val: counts.unreadMsgs, to: '/admin/messages/' },
                  ].map((c) => (
                    <Link
                      key={c.label}
                      to={c.to}
                      className="dopa-card no-underline text-[var(--fg)] hover:border-[var(--accent)]"
                    >
                      <div className="text-xs text-[var(--muted)]">{c.label}</div>
                      <div className="text-3xl font-extrabold num mt-1 text-[var(--accent)]">
                        {c.val}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="dopa-card flat grid sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Total Users</span>
                    <b className="text-lg num">{users.length}</b>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Approved Members</span>
                    <b className="text-lg num">
                      {memberships.filter((m) => m.status === 'Approved').length}
                    </b>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Live Pharmacies</span>
                    <b className="text-lg num">
                      {pharmacies.filter((p) => p.status === 'Approved').length}
                    </b>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Shop + RM Orders</span>
                    <b className="text-lg num">{orders.length + rmOrders.length}</b>
                  </div>
                </div>
              </>
            )}

            {tab === 'dopa-applications' && (
              <div className="flex flex-col gap-3">
                {memberships
                  .filter((m) =>
                    q
                      ? `${m.fullName} ${m.memberNo} ${m.cnic} ${m.city}`.toLowerCase().includes(q)
                      : true
                  )
                  .map((m) => (
                    <div key={m.id} className="dopa-card flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                              {m.memberNo}
                            </span>
                            <h3 className="text-base font-bold">{m.fullName}</h3>
                            <StatusBadge status={m.status} />
                          </div>
                          <div className="text-xs text-[var(--muted)] mt-1">
                            CNIC: {m.cnic} · {m.qualification} · {m.university} ({m.gradYear}) · {m.city}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewMember(m)}
                            className="dopa-btn sm ghost"
                          >
                            Card &amp; Proof
                          </button>
                          <button
                            type="button"
                            onClick={() => adminReviewMembership(m.id, 'Approved')}
                            className="dopa-btn sm primary"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModal(m);
                              setRejectReason('');
                            }}
                            className="dopa-btn sm danger"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {tab === 'members' && (
              <div className="flex flex-col gap-3">
                {memberships
                  .filter((m) => m.status !== 'Pending')
                  .filter((m) =>
                    q ? `${m.fullName} ${m.memberNo} ${m.city}`.toLowerCase().includes(q) : true
                  )
                  .map((m) => (
                    <div key={m.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                            {m.memberNo}
                          </span>
                          <span className="font-bold">{m.fullName}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">
                          {m.qualification} · {m.city} · Expires{' '}
                          {m.expiresAt ? formatDateShort(m.expiresAt) : '—'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewMember(m)}
                          className="dopa-btn sm ghost"
                        >
                          Preview Card
                        </button>
                        <button
                          type="button"
                          onClick={() => adminReviewMembership(m.id, 'Renew')}
                          className="dopa-btn sm ghost"
                        >
                          Renew 12m
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            adminReviewMembership(m.id, 'Revoked', 'Revoked by administrator.')
                          }
                          className="dopa-btn sm danger"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {tab === 'pharmacies' && (
              <div className="flex flex-col gap-3">
                {pharmacies
                  .filter((p) =>
                    q ? `${p.name} ${p.city} ${p.licenceNo}`.toLowerCase().includes(q) : true
                  )
                  .map((ph) => (
                    <div key={ph.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold">{ph.name}</h3>
                          <StatusBadge status={ph.status} />
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-1">
                          Owner: {ph.ownerName} · Licence: {ph.licenceNo} · {ph.city} · Ref:{' '}
                          {ph.paidRef || '—'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectPharmacy(ph)}
                          className="dopa-btn sm ghost"
                        >
                          Inspect
                        </button>
                        {ph.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => adminReviewPharmacy(ph.id, 'Approved')}
                            className="dopa-btn sm primary"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => adminReviewPharmacy(ph.id, 'Renew')}
                          className="dopa-btn sm ghost"
                        >
                          Renew 12m
                        </button>
                        {ph.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => adminReviewPharmacy(ph.id, 'Rejected')}
                            className="dopa-btn sm danger"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {tab === 'products' && (
              <div className="flex flex-col gap-5">
                <div className="dopa-card flat flex flex-col gap-3">
                  <h3>Product categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {settings.productCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-medium"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings({
                              productCategories: settings.productCategories.filter((c) => c !== cat),
                            })
                          }
                          className="text-[var(--bad)] cursor-pointer"
                          aria-label={`Remove ${cat}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCategory.trim()) return;
                        updateSettings({
                          productCategories: [...settings.productCategories, newCategory.trim()],
                        });
                        setNewCategory('');
                      }}
                      className="dopa-btn sm primary"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {products.map((prod) => (
                  <div key={prod.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{prod.name}</span>
                        <StatusBadge status={prod.active ? 'Live' : 'Hidden'} />
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {prod.category} · {formatPKR(prod.price)} · Stock: {prod.stock}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => upsertProduct({ ...prod, active: !prod.active })}
                        className="dopa-btn sm ghost"
                      >
                        {prod.active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(prod.id)}
                        className="dopa-btn sm danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'orders' && (
              <div className="flex flex-col gap-4">
                <h3>Shop Orders ({orders.length}) &amp; Raw Material Orders ({rmOrders.length})</h3>
                {orders.map((o) => (
                  <div key={o.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                        {o.orderNumber}
                      </span>{' '}
                      · <b>{o.buyerName}</b> → {o.pharmacyName}
                      <div className="text-xs text-[var(--muted)]">
                        {formatPKR(o.total)} · Ref {o.paymentRef}
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
                {rmOrders.map((o) => (
                  <div key={o.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                        {o.orderNumber}
                      </span>{' '}
                      · <b>{o.materialName}</b> → {o.sellerName}
                      <div className="text-xs text-[var(--muted)]">
                        {formatPKR(o.total)} · Buyer: {o.buyerName}
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}

            {tab === 'medicine-requests' && (
              <div className="flex flex-col gap-3">
                {medRequests.map((r) => (
                  <div key={r.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <b>{r.medicineName}</b> ({r.strengthForm})
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Patient: {r.userName} ({r.city}) · {r.replies.length} pharmacy replies
                      </div>
                    </div>
                    <span className="text-xs text-[var(--muted)]">{formatDateShort(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'raw-materials' && (
              <div className="flex flex-col gap-4">
                <h3>Seller Applications</h3>
                {sellers.map((s) => (
                  <div key={s.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <b>{s.businessName}</b>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {s.contactPerson} · {s.phone} · {s.city} · {s.ntnOrLicence || 'No NTN'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => adminReviewSeller(s.id, 'Approved')}
                        className="dopa-btn sm primary"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => adminReviewSeller(s.id, 'Rejected')}
                        className="dopa-btn sm danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}

                <h3 className="mt-2">Raw Material Listings ({rawMaterials.length})</h3>
                {rawMaterials.map((m) => (
                  <div key={m.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <b>{m.name}</b> ({m.grade}) — {formatPKR(m.pricePerUnit)}/{m.unit}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => upsertRawMaterial({ ...m, active: !m.active })}
                        className="dopa-btn sm ghost"
                      >
                        {m.active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRawMaterial(m.id)}
                        className="dopa-btn sm danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'jobs' && (
              <div className="flex flex-col gap-3">
                {jobs.map((j) => (
                  <div key={j.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <b>{j.title}</b>
                        <StatusBadge status={j.status} />
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {j.organisation} · {j.location} · Deadline {formatDateShort(j.deadline)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateJob(j.id, { status: 'Live' })}
                        className="dopa-btn sm primary"
                      >
                        Approve (Live)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateJob(j.id, { status: 'Rejected' })}
                        className="dopa-btn sm ghost"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteJob(j.id)}
                        className="dopa-btn sm danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'life-partner' && (
              <div className="flex flex-col gap-3">
                {lpProfiles.map((p) => (
                  <div key={p.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <b>{p.name}</b> ({p.gender}, {p.age}y)
                        <StatusBadge status={`Profile: ${p.status}`} />
                        <StatusBadge status={`Fee: ${p.paymentStatus}`} />
                      </div>
                      <div className="text-xs text-[var(--muted)] mt-0.5">
                        {p.qualification} · {p.city} · Ref: {p.paymentRef || '—'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => adminReviewLpProfile(p.id, 'Approved', 'Approved')}
                        className="dopa-btn sm primary"
                      >
                        Approve Profile &amp; Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => adminReviewLpProfile(p.id, 'Rejected')}
                        className="dopa-btn sm danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'community' && (
              <div className="flex flex-col gap-4">
                <h3>Videos Moderation</h3>
                {videos.map((v) => (
                  <div key={v.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <b>{v.title}</b>
                        <StatusBadge status={v.status} />
                      </div>
                      <div className="text-xs text-[var(--muted)]">By {v.uploaderName}</div>
                    </div>
                    <div className="flex gap-2">
                      {v.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => adminModerateVideo(v.id, 'approve')}
                          className="dopa-btn sm primary"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => adminModerateVideo(v.id, 'delete')}
                        className="dopa-btn sm danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                <h3 className="mt-2">Community Posts</h3>
                {posts.map((p) => (
                  <div key={p.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <b>{p.title || p.type}</b> by {p.authorName}
                      <div className="text-xs text-[var(--muted)] truncate max-w-md">{p.body}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => adminModeratePost(p.id, 'pin')}
                        className="dopa-btn sm ghost"
                      >
                        {p.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => adminModeratePost(p.id, 'delete')}
                        className="dopa-btn sm danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'content' && (
              <div className="flex flex-col gap-5">
                {/* Articles */}
                <div className="dopa-card flat flex flex-col gap-3">
                  <h3>Articles &amp; News ({articles.length})</h3>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder="Article title"
                      value={newArticleTitle}
                      onChange={(e) => setNewArticleTitle(e.target.value)}
                    />
                    <select
                      className="dopa-input"
                      value={newArticleCat}
                      onChange={(e) => setNewArticleCat(e.target.value as 'Articles' | 'News')}
                    >
                      <option value="Articles">Articles</option>
                      <option value="News">News</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newArticleTitle.trim()) return;
                        const payload: Omit<Article, 'id'> = {
                          slug: newArticleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                          category: newArticleCat,
                          title: newArticleTitle.trim(),
                          excerpt: newArticleExcerpt.trim() || 'Published from DOPA Admin CMS.',
                          content: [newArticleExcerpt.trim() || 'Full pharmacy resource briefing.'],
                          author: 'DOPA Editorial Board',
                          coverImage: '/assets/uploads/slide-pip.jpg',
                          publishedAt: new Date().toISOString().slice(0, 10),
                          membersOnly: false,
                        };
                        upsertArticle(payload);
                        setNewArticleTitle('');
                        setNewArticleExcerpt('');
                      }}
                      className="dopa-btn sm primary"
                    >
                      Publish article
                    </button>
                  </div>
                  <input
                    type="text"
                    className="dopa-input"
                    placeholder="Summary excerpt..."
                    value={newArticleExcerpt}
                    onChange={(e) => setNewArticleExcerpt(e.target.value)}
                  />
                  {articles.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 text-sm py-1.5 border-t border-[var(--line)]">
                      <span>
                        <b>{a.title}</b> ({a.category})
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteArticle(a.id)}
                        className="dopa-btn sm ghost text-[var(--bad)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* FAQs */}
                <div className="dopa-card flat flex flex-col gap-3">
                  <h3>FAQs ({faqs.length})</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder="FAQ Question"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                    />
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder="Answer"
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFaqQ.trim() || !newFaqA.trim()) return;
                      upsertFaq({ question: newFaqQ.trim(), answer: newFaqA.trim() });
                      setNewFaqQ('');
                      setNewFaqA('');
                    }}
                    className="dopa-btn sm primary self-start"
                  >
                    Add FAQ
                  </button>
                  {faqs.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-2 text-sm py-1.5 border-t border-[var(--line)]">
                      <span className="truncate">{f.question}</span>
                      <button
                        type="button"
                        onClick={() => deleteFaq(f.id)}
                        className="dopa-btn sm ghost text-[var(--bad)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Universities */}
                <div className="dopa-card flat flex flex-col gap-3">
                  <h3>Universities Directory ({universities.length})</h3>
                  <div className="grid sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      className="dopa-input sm:col-span-2"
                      placeholder="University name"
                      value={newUniName}
                      onChange={(e) => setNewUniName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="dopa-input"
                      placeholder="City"
                      value={newUniCity}
                      onChange={(e) => setNewUniCity(e.target.value)}
                    />
                    <select
                      className="dopa-input"
                      value={newUniSector}
                      onChange={(e) => setNewUniSector(e.target.value as 'Public' | 'Private')}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newUniName.trim()) return;
                      upsertUniversity({
                        name: newUniName.trim(),
                        city: newUniCity.trim() || 'Lahore',
                        sector: newUniSector,
                      });
                      setNewUniName('');
                    }}
                    className="dopa-btn sm primary self-start"
                  >
                    Add university
                  </button>
                  <div className="max-h-56 overflow-y-auto flex flex-col divide-y divide-[var(--line)]">
                    {universities.map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-1.5 text-sm">
                        <span>
                          {u.name} — {u.city} ({u.sector})
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteUniversity(u.id)}
                          className="text-[var(--bad)] cursor-pointer px-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slider titles */}
                <div className="dopa-card flat flex flex-col gap-2">
                  <h3>Home News Carousel ({slides.length} slides)</h3>
                  {slides.map((s, idx) => (
                    <div key={s.id} className="flex gap-2 items-center">
                      <span className="text-xs font-mono-dopa text-[var(--muted)]">#{idx + 1}</span>
                      <input
                        type="text"
                        className="dopa-input"
                        value={s.title}
                        onChange={(e) => {
                          const updated = slides.map((item) =>
                            item.id === s.id ? { ...item, title: e.target.value } : item
                          );
                          setSlides(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="flex flex-col gap-3">
                {users
                  .filter((u) =>
                    q ? `${u.name} ${u.email} ${u.city}`.toLowerCase().includes(q) : true
                  )
                  .map((u) => (
                    <div key={u.id} className="dopa-card flat flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <b>{u.name}</b>
                          <StatusBadge status={u.role === 'admin' ? 'Admin' : 'User'} />
                          {u.blocked && <StatusBadge status="Blocked" />}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {u.email} · {u.qualification} · {u.city}
                        </div>
                      </div>
                      {u.id !== currentUser.id && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => adminUpdateUser(u.id, { blocked: !u.blocked })}
                            className={`dopa-btn sm ${u.blocked ? 'primary' : 'danger'}`}
                          >
                            {u.blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              adminUpdateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })
                            }
                            className="dopa-btn sm ghost"
                          >
                            {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {tab === 'messages' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {(['All', 'Doctor of Pharmacy (Pharm.D)', 'DOPA Association'] as const).map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setMsgFilter(f)}
                        className={`dopa-btn sm ${msgFilter === f ? 'primary' : 'ghost'}`}
                      >
                        {f}
                      </button>
                    )
                  )}
                </div>
                {messages
                  .filter((m) => (msgFilter === 'All' ? true : m.target === msgFilter))
                  .map((m) => (
                    <div key={m.id} className="dopa-card flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold">{m.name}</span> ({m.email}) →{' '}
                          <span className="text-xs font-semibold text-[var(--accent)]">
                            {m.target}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={m.read ? 'Read' : 'Unread'} />
                          <button
                            type="button"
                            onClick={() => markMessageRead(m.id, !m.read)}
                            className="dopa-btn sm ghost"
                          >
                            {m.read ? 'Mark unread' : 'Mark read'}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{m.message}</p>
                    </div>
                  ))}
              </div>
            )}

            {tab === 'settings' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings({
                    pharmacyFee: Number(phFee),
                    lifePartnerFee: Number(lpFee),
                    dopaEmail,
                    pharmdPhone,
                  });
                }}
                className="dopa-card max-w-2xl flex flex-col gap-4"
              >
                <h3>Platform Fees &amp; Contact Settings</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Pharmacy annual fee (PKR)</label>
                    <input
                      type="number"
                      className="dopa-input"
                      value={phFee}
                      onChange={(e) => setPhFee(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Life Partner 12m fee (PKR)</label>
                    <input
                      type="number"
                      className="dopa-input"
                      value={lpFee}
                      onChange={(e) => setLpFee(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">DOPA Association email</label>
                    <input
                      type="email"
                      className="dopa-input"
                      value={dopaEmail}
                      onChange={(e) => setDopaEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Pharm.D contact phone</label>
                    <input
                      type="text"
                      className="dopa-input"
                      value={pharmdPhone}
                      onChange={(e) => setPharmdPhone(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="dopa-btn primary self-start">
                  Save settings
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Member Card + Proof Modal */}
      <Modal
        open={Boolean(previewMember)}
        onClose={() => setPreviewMember(null)}
        title={previewMember ? `${previewMember.fullName} (${previewMember.memberNo})` : ''}
      >
        {previewMember && (
          <div className="flex flex-col gap-4">
            <MemberCard membership={previewMember} />
            <div className="text-xs text-[var(--muted)]">
              CNIC: {previewMember.cnic} · Phone: {previewMember.phone} · Proof file:{' '}
              {previewMember.proofFileName || 'Verified offline'}
            </div>
            {previewMember.proofFileData && (
              <img
                src={previewMember.proofFileData}
                alt="Qualification proof"
                className="max-h-48 rounded-xl border border-[var(--line)]"
              />
            )}
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        open={Boolean(rejectModal)}
        onClose={() => setRejectModal(null)}
        title="Reject DOPA Application"
      >
        {rejectModal && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--muted)]">
              Provide a clear reason for declining {rejectModal.fullName}&rsquo;s application.
            </p>
            <textarea
              rows={3}
              className="dopa-input"
              placeholder="e.g. Unreadable degree scan — please re-upload."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectModal(null)} className="dopa-btn sm ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  adminReviewMembership(rejectModal.id, 'Rejected', rejectReason.trim());
                  setRejectModal(null);
                }}
                className="dopa-btn sm danger"
              >
                Confirm rejection
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Inspect Pharmacy Modal */}
      <Modal
        open={Boolean(inspectPharmacy)}
        onClose={() => setInspectPharmacy(null)}
        title={inspectPharmacy?.name || ''}
      >
        {inspectPharmacy && (
          <div className="flex flex-col gap-2.5 text-sm">
            <StatusBadge status={inspectPharmacy.status} />
            <div>
              <b>Owner:</b> {inspectPharmacy.ownerName} ({inspectPharmacy.phone})
            </div>
            <div>
              <b>Licence No:</b> {inspectPharmacy.licenceNo}
            </div>
            <div>
              <b>Address:</b> {inspectPharmacy.address}, {inspectPharmacy.city}
            </div>
            <div>
              <b>Bank Account:</b> {inspectPharmacy.bankDetails.accountTitle} —{' '}
              {inspectPharmacy.bankDetails.bankName} ({inspectPharmacy.bankDetails.iban})
            </div>
            <div>
              <b>Payment Ref:</b> {inspectPharmacy.paidRef || '—'}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message="This restores all localStorage records (users, memberships, pharmacies, products, orders, jobs, messages) back to initial demo seed data."
        confirmLabel="Reset data"
        danger
        onConfirm={() => {
          resetAllDemoData();
          pushToast('All demo data restored to defaults.', 'info');
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};
