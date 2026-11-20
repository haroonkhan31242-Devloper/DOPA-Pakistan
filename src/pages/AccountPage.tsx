import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  Briefcase,
  FlaskConical,
  Heart,
  LayoutDashboard,
  Lock,
  LogOut,
  Phone,
  Pill,
  ShoppingBag,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PAKISTAN_CITIES, QUALIFICATIONS } from '../data/seedData';
import type { Order, OrderStatus, Qualification, RmOrder } from '../types';
import {
  AuthGate,
  ConfirmDialog,
  EmptyState,
  MemberCard,
  Modal,
  PageHeader,
  PasswordInput,
  StatusBadge,
} from '../components/ui';
import { daysRemaining, formatDateShort, formatPKR, validatePassword } from '../lib/formatters';

/* ================= M16 USER ACCOUNT AREA (/account/*) ================= */
export const AccountPage: React.FC = () => {
  const {
    currentUser,
    currentPharmacy,
    currentMembership,
    isActiveDopaMember,
    currentLpProfile,
    orders,
    rmOrders,
    medRequests,
    jobs,
    notifications,
    unreadNotificationsCount,
    updateUserProfile,
    changePassword,
    renewDopaMembership,
    closeMedicineRequest,
    deleteJob,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
    pushToast,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Lahore');
  const [qual, setQual] = useState<Qualification>(currentUser?.qualification || 'Pharm.D');

  // Password form state
  const [currPw, setCurrPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);

  // Detail modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRmOrder, setSelectedRmOrder] = useState<RmOrder | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  if (currentPharmacy && !currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <EmptyState
            icon={<UserIcon className="w-6 h-6" />}
            title={`Signed in as ${currentPharmacy.name}`}
            description="You are currently signed in with a Pharmacy Account. Open your Pharmacy Dashboard to manage products and orders."
            action={
              <Link to="/pharmacy-dashboard/" className="dopa-btn primary">
                Go to Pharmacy Dashboard
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="My Account"
            message="Sign in to manage your profile, DOPA membership card, orders, medicine requests, and notifications."
            redirectTo={location.pathname}
          />
        </div>
      </div>
    );
  }

  const path = location.pathname;
  const tab = path.includes('/profile')
    ? 'profile'
    : path.includes('/membership')
    ? 'membership'
    : path.includes('/rm-orders')
    ? 'rm-orders'
    : path.includes('/orders')
    ? 'orders'
    : path.includes('/requests')
    ? 'requests'
    : path.includes('/jobs')
    ? 'jobs'
    : path.includes('/notifications')
    ? 'notifications'
    : path.includes('/security')
    ? 'security'
    : 'dashboard';

  const myOrders = orders.filter((o) => o.buyerId === currentUser.id);
  const myRmOrders = rmOrders.filter((o) => o.buyerId === currentUser.id);
  const myMedRequests = medRequests.filter((r) => r.userId === currentUser.id);
  const myJobs = jobs.filter((j) => j.posterId === currentUser.id);
  const myNotifs = notifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'ALL'
  );

  const navItems = [
    { to: '/account/', key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/account/profile/', key: 'profile', label: 'My profile', icon: UserIcon },
    { to: '/account/membership/', key: 'membership', label: 'DOPA membership', icon: Award },
    { to: '/account/orders/', key: 'orders', label: `My orders (${myOrders.length})`, icon: ShoppingBag },
    { to: '/account/requests/', key: 'requests', label: `Medicine requests (${myMedRequests.length})`, icon: Pill },
    { to: '/account/rm-orders/', key: 'rm-orders', label: `My RM orders (${myRmOrders.length})`, icon: FlaskConical },
    { to: '/account/jobs/', key: 'jobs', label: `My jobs (${myJobs.length})`, icon: Briefcase },
    {
      to: '/account/notifications/',
      key: 'notifications',
      label: `Notifications${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount})` : ''}`,
      icon: Bell,
    },
    { to: '/account/security/', key: 'security', label: 'Security', icon: Lock },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return pushToast('Name is required.', 'bad');
    updateUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      qualification: qual,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    const err = validatePassword(newPw);
    if (err) return setPwError(err);
    if (newPw !== confirmPw) return setPwError('New passwords do not match.');
    const res = changePassword(currPw, newPw);
    if (!res.ok) return setPwError(res.error || 'Could not update password.');
    setCurrPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const orderSteps: OrderStatus[] = [
    'Waiting for payment confirmation',
    'Payment confirmed',
    'Dispatched',
    'Delivered',
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }]}
        eyebrow={currentUser.qualification}
        title={`Welcome, ${currentUser.name}`}
        actions={
          currentUser.role === 'admin' && (
            <Link to="/admin/" className="dopa-btn sm primary">
              Open Admin Panel
            </Link>
          )
        }
      />

      <section className="pb-12">
        <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 dopa-card flat p-3 flex flex-col gap-1">
            {navItems.map((item) => {
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
                  <Icon className="w-4 h-4 shrink-0" /> {item.label}
                </Link>
              );
            })}

            <Link
              to="/life-partner/"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium no-underline text-[var(--fg)] hover:bg-[var(--surface2)]"
            >
              <Heart className="w-4 h-4 shrink-0" /> Find a life partner
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--bad)] hover:bg-[var(--badbg)] cursor-pointer text-left mt-1"
            >
              <LogOut className="w-4 h-4 shrink-0" /> Sign out
            </button>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {tab === 'dashboard' && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">DOPA Membership</div>
                    <div className="mt-2">
                      <StatusBadge
                        status={currentMembership ? currentMembership.status : 'Not applied'}
                      />
                    </div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">Shop Orders</div>
                    <div className="text-2xl font-bold mt-1 num">{myOrders.length}</div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">Medicine Requests</div>
                    <div className="text-2xl font-bold mt-1 num">{myMedRequests.length}</div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs text-[var(--muted)]">Unread Notifications</div>
                    <div className="text-2xl font-bold mt-1 num text-[var(--accent)]">
                      {unreadNotificationsCount}
                    </div>
                  </div>
                </div>

                {currentMembership && isActiveDopaMember && (
                  <div className="dopa-card">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <h3>Your Digital DOPA Membership Card</h3>
                        <p className="text-xs text-[var(--muted)]">
                          Valid until {currentMembership.expiresAt ? formatDateShort(currentMembership.expiresAt) : '—'}
                        </p>
                      </div>
                      <Link to="/account/membership/" className="dopa-btn sm ghost">
                        Manage membership
                      </Link>
                    </div>
                    <div className="max-w-md">
                      <MemberCard membership={currentMembership} showActions />
                    </div>
                  </div>
                )}

                <div className="dopa-card flat">
                  <h3 className="mb-3">Shortcuts</h3>
                  <div className="flex flex-wrap gap-2.5">
                    <Link to="/shop/" className="dopa-btn sm ghost">
                      Browse Shop
                    </Link>
                    <Link to="/request-medicine/" className="dopa-btn sm ghost">
                      Request a Medicine
                    </Link>
                    <Link to="/jobs/" className="dopa-btn sm ghost">
                      Job Board
                    </Link>
                    <Link to="/community/" className="dopa-btn sm ghost">
                      Community Feed
                    </Link>
                    {currentLpProfile ? (
                      <Link to="/life-partner/browse/" className="dopa-btn sm ghost">
                        Life Partner Browse
                      </Link>
                    ) : (
                      <Link to="/life-partner/" className="dopa-btn sm ghost">
                        Life Partner Service
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="dopa-card flex flex-col gap-4 max-w-2xl">
                <h2>My profile</h2>
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
                    <label className="text-sm font-semibold">Email (read-only)</label>
                    <input
                      type="email"
                      className="dopa-input opacity-75"
                      value={currentUser.email}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Phone</label>
                    <input
                      type="tel"
                      className="dopa-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">City</label>
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
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Qualification</label>
                  <select
                    className="dopa-input"
                    value={qual}
                    onChange={(e) => setQual(e.target.value as Qualification)}
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button type="submit" className="dopa-btn primary">
                    Save profile changes
                  </button>
                </div>
              </form>
            )}

            {tab === 'membership' && (
              <div className="flex flex-col gap-5">
                {!currentMembership ? (
                  <EmptyState
                    icon={<Award className="w-6 h-6" />}
                    title="No DOPA Association membership yet"
                    description="Join Pakistan's Doctor of Pharmacy Association free for verified Pharm.D graduates, students, and allied pharmacists."
                    action={
                      <Link to="/dopa-association/" className="dopa-btn primary">
                        Apply for DOPA membership
                      </Link>
                    }
                  />
                ) : (
                  <div className="dopa-card flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono-dopa text-sm font-bold text-[var(--accent)]">
                            {currentMembership.memberNo}
                          </span>
                          <StatusBadge status={currentMembership.status} />
                        </div>
                        <div className="text-sm text-[var(--muted)]">
                          Submitted {formatDateShort(currentMembership.submittedAt)}
                          {currentMembership.expiresAt
                            ? ` · Expires ${formatDateShort(currentMembership.expiresAt)} (${daysRemaining(currentMembership.expiresAt)} days left)`
                            : ''}
                        </div>
                      </div>
                      {(currentMembership.status === 'Expired' ||
                        daysRemaining(currentMembership.expiresAt) < 45) && (
                        <button
                          type="button"
                          onClick={() => renewDopaMembership(currentMembership.id)}
                          className="dopa-btn sm primary"
                        >
                          Renew 12 months
                        </button>
                      )}
                    </div>

                    {currentMembership.status === 'Rejected' && currentMembership.rejectionReason && (
                      <div className="p-3.5 rounded-xl bg-[var(--badbg)] text-[var(--bad)] text-sm">
                        <b>Rejection reason:</b> {currentMembership.rejectionReason}
                      </div>
                    )}

                    <div className="max-w-md">
                      <MemberCard
                        membership={currentMembership}
                        showActions={currentMembership.status === 'Approved'}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'orders' && (
              <div className="flex flex-col gap-4">
                {myOrders.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag className="w-6 h-6" />}
                    title="No pharmacy orders yet"
                    description="Browse verified pharmacy products and place your first order."
                    action={
                      <Link to="/shop/" className="dopa-btn primary">
                        Browse Shop
                      </Link>
                    }
                  />
                ) : (
                  myOrders.map((o) => (
                    <div key={o.id} className="dopa-card flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono-dopa text-xs font-bold text-[var(--accent)]">
                            {o.orderNumber}
                          </span>
                          <h3 className="text-base font-bold">{o.pharmacyName}</h3>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        {o.items.map((it) => `${it.name} x${it.quantity}`).join(', ')} ·{' '}
                        <b className="text-[var(--fg)] num">{formatPKR(o.total)}</b>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
                        <span className="text-xs text-[var(--muted)]">
                          Placed {formatDateShort(o.createdAt)} · Ref {o.paymentRef}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="dopa-btn sm ghost"
                        >
                          View timeline &amp; details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'requests' && (
              <div className="flex flex-col gap-4">
                {myMedRequests.length === 0 ? (
                  <EmptyState
                    icon={<Pill className="w-6 h-6" />}
                    title="No medicine requests yet"
                    description="Upload a prescription to ask all registered pharmacies across Pakistan for availability and price."
                    action={
                      <Link to="/request-medicine/" className="dopa-btn primary">
                        Request a medicine
                      </Link>
                    }
                  />
                ) : (
                  myMedRequests.map((req) => (
                    <div key={req.id} className="dopa-card flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold">
                            {req.medicineName} ({req.strengthForm})
                          </h3>
                          <div className="text-xs text-[var(--muted)]">
                            Quantity: {req.quantity} · City: {req.city} · {formatDateShort(req.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={req.status} />
                          {req.status === 'Open' && (
                            <button
                              type="button"
                              onClick={() => closeMedicineRequest(req.id)}
                              className="dopa-btn sm ghost"
                            >
                              Close request
                            </button>
                          )}
                        </div>
                      </div>

                      {req.replies.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[var(--surface2)] text-xs text-[var(--muted)]">
                          Waiting for replies from registered pharmacies...
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                            Pharmacy replies ({req.replies.length})
                          </div>
                          {req.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-3.5 rounded-xl bg-[var(--surface2)] flex flex-wrap items-center justify-between gap-3"
                            >
                              <div>
                                <div className="font-bold text-sm">
                                  {rep.pharmacyName}{' '}
                                  <span className="font-normal text-xs text-[var(--muted)]">
                                    ({rep.pharmacyCity})
                                  </span>
                                </div>
                                <div className="text-xs text-[var(--muted)] mt-0.5">
                                  {rep.available
                                    ? `Available${rep.price ? ` · ${formatPKR(rep.price)}` : ''}`
                                    : 'Not in stock'}{' '}
                                  — {rep.note}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <a href={`tel:${rep.pharmacyPhone}`} className="dopa-btn sm ghost">
                                  <Phone className="w-3.5 h-3.5" /> Call
                                </a>
                                {rep.available && (
                                  <Link
                                    to={`/shop/?q=${encodeURIComponent(req.medicineName)}`}
                                    className="dopa-btn sm primary"
                                  >
                                    Order from this pharmacy
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'rm-orders' && (
              <div className="flex flex-col gap-4">
                {myRmOrders.length === 0 ? (
                  <EmptyState
                    icon={<FlaskConical className="w-6 h-6" />}
                    title="No raw material orders yet"
                    description="Browse APIs, excipients, and solvents in the B2B marketplace."
                    action={
                      <Link to="/raw-materials/" className="dopa-btn primary">
                        Browse raw materials
                      </Link>
                    }
                  />
                ) : (
                  myRmOrders.map((o) => (
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
                      <div className="text-sm text-[var(--muted)]">
                        Supplier: <b className="text-[var(--fg)]">{o.sellerName}</b> · Total:{' '}
                        <b className="text-[var(--fg)] num">{formatPKR(o.total)}</b>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--line)] text-xs text-[var(--muted)]">
                        <span>Transfer ref: {o.paymentRef}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedRmOrder(o)}
                          className="dopa-btn sm ghost"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'jobs' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3>Jobs posted by you</h3>
                  <Link to="/post-job/" className="dopa-btn sm primary">
                    Post a job
                  </Link>
                </div>
                {myJobs.length === 0 ? (
                  <EmptyState
                    icon={<Briefcase className="w-6 h-6" />}
                    title="No jobs posted yet"
                    description="Post a hospital, retail, or industrial pharmacy opening for free."
                    action={
                      <Link to="/post-job/" className="dopa-btn primary">
                        Post a job
                      </Link>
                    }
                  />
                ) : (
                  myJobs.map((j) => (
                    <div key={j.id} className="dopa-card flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold">{j.title}</h3>
                          <StatusBadge status={j.status} />
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {j.organisation} · {j.location} · Deadline {formatDateShort(j.deadline)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {j.status === 'Live' && (
                          <Link to={`/jobs/${j.slug}/`} className="dopa-btn sm ghost">
                            View
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteJobId(j.id)}
                          className="dopa-btn sm ghost text-[var(--bad)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'notifications' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3>Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="dopa-btn sm ghost"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {myNotifs.length === 0 ? (
                  <EmptyState icon={<Bell className="w-6 h-6" />} title="No notifications yet" />
                ) : (
                  myNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`dopa-card flat flex flex-wrap items-center justify-between gap-3 ${
                        !n.read ? 'border-[var(--accent)]' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
                          )}
                          <span className="font-bold text-sm">{n.title}</span>
                          <span className="text-xs text-[var(--muted)]">
                            {formatDateShort(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-1">{n.body}</p>
                      </div>
                      <div className="flex gap-2">
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(n.id)}
                            className="dopa-btn sm ghost"
                          >
                            Mark read
                          </button>
                        )}
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => markNotificationRead(n.id)}
                            className="dopa-btn sm primary"
                          >
                            Open
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'security' && (
              <form onSubmit={handleChangePassword} className="dopa-card max-w-xl flex flex-col gap-4">
                <h2>Security &amp; password</h2>
                {pwError && (
                  <div className="p-3 rounded-xl bg-[var(--badbg)] text-[var(--bad)] text-sm">
                    {pwError}
                  </div>
                )}
                <PasswordInput
                  id="currPw"
                  label="Current password"
                  value={currPw}
                  onChange={setCurrPw}
                  showStrengthHint={false}
                  required
                />
                <PasswordInput
                  id="newPw"
                  label="New password"
                  value={newPw}
                  onChange={setNewPw}
                  required
                />
                <PasswordInput
                  id="confirmPw"
                  label="Confirm new password"
                  value={confirmPw}
                  onChange={setConfirmPw}
                  showStrengthHint={false}
                  required
                />
                <div>
                  <button type="submit" className="dopa-btn primary">
                    Update password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Order Timeline Modal */}
      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ''}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-4 text-sm">
            <StatusBadge status={selectedOrder.status} />
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-[var(--surface2)]">
              <div className="font-semibold text-xs uppercase text-[var(--muted)]">
                Status timeline
              </div>
              {orderSteps.map((st, idx) => {
                const currentIdx = orderSteps.indexOf(selectedOrder.status);
                const done = selectedOrder.status !== 'Cancelled' && currentIdx >= idx;
                return (
                  <div
                    key={st}
                    className={`flex items-center gap-2 ${
                      done ? 'text-[var(--ok)] font-semibold' : 'text-[var(--muted)]'
                    }`}
                  >
                    <span>{done ? '✓' : '○'}</span>
                    <span>{st}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <b>Pharmacy:</b> {selectedOrder.pharmacyName}
            </div>
            <div>
              <b>Delivery Address:</b> {selectedOrder.deliveryAddress}, {selectedOrder.buyerCity}
            </div>
            <div>
              <b>Transfer Ref:</b> <span className="font-mono-dopa">{selectedOrder.paymentRef}</span>
            </div>
            <div className="border-t border-[var(--line)] pt-2">
              {selectedOrder.items.map((it) => (
                <div key={it.productId} className="flex justify-between py-1">
                  <span>
                    {it.name} x {it.quantity}
                  </span>
                  <span className="num font-semibold">{formatPKR(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-[var(--line)] font-bold">
                <span>Total</span>
                <span className="num">{formatPKR(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(selectedRmOrder)}
        onClose={() => setSelectedRmOrder(null)}
        title={selectedRmOrder ? `RM Order ${selectedRmOrder.orderNumber}` : ''}
      >
        {selectedRmOrder && (
          <div className="flex flex-col gap-3 text-sm">
            <StatusBadge status={selectedRmOrder.status} />
            <div>
              <b>Material:</b> {selectedRmOrder.materialName} ({selectedRmOrder.quantity}{' '}
              {selectedRmOrder.unit})
            </div>
            <div>
              <b>Supplier:</b> {selectedRmOrder.sellerName}
            </div>
            <div>
              <b>Total:</b> <span className="num font-bold">{formatPKR(selectedRmOrder.total)}</span>
            </div>
            <div>
              <b>Delivery Address:</b> {selectedRmOrder.deliveryAddress}, {selectedRmOrder.buyerCity}
            </div>
            <div>
              <b>Payment Ref:</b> <span className="font-mono-dopa">{selectedRmOrder.paymentRef}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteJobId)}
        title="Delete job listing?"
        message="This will permanently remove your job posting."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteJobId) deleteJob(deleteJobId);
        }}
        onCancel={() => setDeleteJobId(null)}
      />
    </div>
  );
};
