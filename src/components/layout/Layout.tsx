import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  FlaskConical,
  HelpCircle,
  Home,
  Info,
  LogOut,
  Mail,
  Menu,
  Moon,
  Newspaper,
  Pill,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Sun,
  User as UserIcon,
  Users,
  Video,
  X,
  FileText,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getPakistanDateTimeParts } from '../../lib/formatters';
import { ToastContainer } from '../ui';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    currentPharmacy,
    isAdmin,
    isApprovedSeller,
    unreadNotificationsCount,
    cartCount,
    logout,
    settings,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [now, setNow] = useState(() => new Date());
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const [acctMenuOpen, setAcctMenuOpen] = useState(false);

  const othersRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOthersOpen(false);
    setAcctMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (othersRef.current && !othersRef.current.contains(e.target as Node)) {
        setOthersOpen(false);
      }
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setAcctMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dt = getPakistanDateTimeParts(now);

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[0.9rem] font-medium no-underline transition-colors whitespace-nowrap shrink-0 relative ${
      isActive
        ? 'text-[var(--accent)] font-semibold bg-[var(--surface2)]'
        : 'text-[var(--fg)] hover:bg-[var(--surface2)]'
    }`;

  const othersLinks = [
    { to: '/pharmacies/', label: 'Registered pharmacies', icon: <Building2 className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/request-medicine/', label: 'Request a medicine', icon: <Pill className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/sell-raw-materials/', label: 'Sell raw materials', icon: <Store className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/community/', label: 'Community', icon: <Users className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/services/', label: 'Our services & struggle', icon: <FileText className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/universities/', label: 'Universities', icon: <GraduationCap className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/resources/', label: 'Articles & news', icon: <Newspaper className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/pharmacy-register/', label: 'Register your pharmacy', icon: <Store className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/faq/', label: 'FAQ', icon: <HelpCircle className="w-4 h-4 text-[var(--accent)]" /> },
    { to: '/contact/', label: 'Contact', icon: <Mail className="w-4 h-4 text-[var(--accent)]" /> },
  ];

  const isSignedIn = Boolean(currentUser || currentPharmacy);
  const displayName = currentUser?.name || currentPharmacy?.name || '';

  return (
    <div className="min-h-screen flex flex-col relative">
      <a className="skip" href="#app">
        Skip to content
      </a>
      <div className="site-wm" aria-hidden="true" />

      <header className={`dopa-hdr ${scrolled ? 'scrolled' : ''}`}>
        {/* Top Row */}
        <div className="wrap flex items-center gap-3 min-h-[70px] py-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline text-[var(--fg)] min-w-0 mr-auto"
            aria-label="Doctor of Pharmacy (Pharm.D) home"
          >
            <img
              src="/assets/img/dopa-logo-192.png"
              alt="DOPA Pakistan Logo"
              width={48}
              height={48}
              className="w-11 h-11 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-sm"
            />
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-display font-extrabold text-[0.95rem] md:text-[1.16rem] text-[var(--fg)] truncate">
                Doctor of Pharmacy (Pharm.D)
              </span>
              <span className="text-[0.72rem] text-[var(--muted)] font-medium whitespace-nowrap">
                {dt.day}, {dt.date} &middot; {dt.time}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/cart/"
              aria-label={`Shopping cart (${cartCount} items)`}
              className="relative w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] grid place-items-center hover:border-[var(--accent)] transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-[var(--btn-fg)] text-[0.68rem] font-bold grid place-items-center num">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/register/" className="dopa-btn ghost sm hidden sm:inline-flex">
                  Sign up
                </Link>
                <Link to="/login/" className="dopa-btn primary sm">
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2" ref={acctRef}>
                <Link
                  to={currentPharmacy ? '/pharmacy-dashboard/' : '/account/notifications/'}
                  aria-label={`Notifications (${unreadNotificationsCount} unread)`}
                  className="relative w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] grid place-items-center hover:border-[var(--accent)] transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--bad)] text-white text-[0.68rem] font-bold grid place-items-center num">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAcctMenuOpen((o) => !o)}
                    aria-expanded={acctMenuOpen}
                    className="dopa-btn ghost sm max-w-[170px]"
                  >
                    <UserIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate hidden sm:inline">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  {acctMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xl p-2 z-70 flex flex-col gap-1">
                      {currentUser && (
                        <>
                          <Link
                            to="/account/"
                            className="px-3 py-2 rounded-xl text-sm text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2"
                          >
                            <UserIcon className="w-4 h-4 text-[var(--accent)]" /> My account
                          </Link>
                          <Link
                            to="/account/orders/"
                            className="px-3 py-2 rounded-xl text-sm text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4 text-[var(--accent)]" /> My orders
                          </Link>
                          <Link
                            to="/account/notifications/"
                            className="px-3 py-2 rounded-xl text-sm text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-[var(--accent)]" /> Notifications
                            </span>
                            {unreadNotificationsCount > 0 && (
                              <span className="text-xs font-bold text-[var(--bad)] num">
                                {unreadNotificationsCount}
                              </span>
                            )}
                          </Link>
                          {isApprovedSeller && (
                            <Link
                              to="/seller-dashboard/"
                              className="px-3 py-2 rounded-xl text-sm text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2"
                            >
                              <FlaskConical className="w-4 h-4 text-[var(--accent)]" /> Seller dashboard
                            </Link>
                          )}
                          {isAdmin && (
                            <Link
                              to="/admin/"
                              className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--accent)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4" /> Admin panel
                            </Link>
                          )}
                        </>
                      )}
                      {currentPharmacy && (
                        <Link
                          to="/pharmacy-dashboard/"
                          className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--accent)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4" /> Pharmacy dashboard
                        </Link>
                      )}
                      <hr className="border-[var(--line)] my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-[var(--bad)] hover:bg-[var(--badbg)] flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light or dark theme"
              className="w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] grid place-items-center hover:border-[var(--accent)] cursor-pointer transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] grid place-items-center cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav Row */}
        <div className="hidden lg:block border-t border-[var(--line)]">
          <nav className="wrap flex items-center flex-wrap gap-0.5 py-1.5" aria-label="Main">
            <NavLink to="/" end className={navLinkCls}>
              <Home className="w-4 h-4 opacity-80" /> Home
            </NavLink>
            <NavLink to="/about/" className={navLinkCls}>
              <Info className="w-4 h-4 opacity-80" /> About
            </NavLink>
            <NavLink to="/shop/" className={navLinkCls}>
              <ShoppingBag className="w-4 h-4 opacity-80" /> Products
            </NavLink>
            <NavLink to="/raw-materials/" className={navLinkCls}>
              <FlaskConical className="w-4 h-4 opacity-80" /> Raw materials
            </NavLink>
            <NavLink to="/jobs/" className={navLinkCls}>
              <Briefcase className="w-4 h-4 opacity-80" /> Jobs
            </NavLink>
            <NavLink
              to="/dopa-association/"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[0.9rem] font-bold no-underline transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--surface2)]'
                    : 'text-[var(--accent)] hover:bg-[var(--surface2)]'
                }`
              }
            >
              <img
                src="/assets/img/dopa-assoc-logo.png"
                alt=""
                width={18}
                height={18}
                className="w-[18px] h-[18px] rounded-full bg-white object-contain"
              />
              DOPA Association
            </NavLink>
            <NavLink to="/life-partner/" className={navLinkCls}>
              <Heart className="w-4 h-4 opacity-80" /> Life partner
            </NavLink>
            <NavLink to="/videos/" className={navLinkCls}>
              <Video className="w-4 h-4 opacity-80" /> Videos
            </NavLink>

            <div className="relative" ref={othersRef}>
              <button
                type="button"
                onClick={() => setOthersOpen((o) => !o)}
                aria-expanded={othersOpen}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-full text-[0.9rem] font-medium text-[var(--fg)] hover:bg-[var(--surface2)] cursor-pointer whitespace-nowrap"
              >
                Others <ChevronDown className={`w-3.5 h-3.5 transition-transform ${othersOpen ? 'rotate-180' : ''}`} />
              </button>

              {othersOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] w-64 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xl p-2 z-70 flex flex-col gap-0.5">
                  {othersLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--line)] bg-[var(--bg)] max-h-[calc(100dvh-70px)] overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
            <Link to="/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <Home className="w-4 h-4 text-[var(--accent)]" /> Home
            </Link>
            <Link to="/about/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[var(--accent)]" /> About
            </Link>
            <Link to="/shop/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-[var(--accent)]" /> Products
            </Link>
            <Link to="/raw-materials/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <FlaskConical className="w-4 h-4 text-[var(--accent)]" /> Raw materials
            </Link>
            <Link to="/jobs/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-[var(--accent)]" /> Jobs
            </Link>
            <Link to="/dopa-association/" className="px-3 py-2.5 rounded-xl font-bold text-[var(--accent)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <img src="/assets/img/dopa-assoc-logo.png" alt="" className="w-4 h-4 rounded-full bg-white" /> DOPA Association
            </Link>
            <Link to="/life-partner/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-[var(--accent)]" /> Life partner
            </Link>
            <Link to="/videos/" className="px-3 py-2.5 rounded-xl font-medium text-[var(--fg)] hover:bg-[var(--surface2)] no-underline flex items-center gap-2.5">
              <Video className="w-4 h-4 text-[var(--accent)]" /> Videos
            </Link>

            <details className="rounded-xl border border-[var(--line)] bg-[var(--surface)] mt-1">
              <summary className="px-3 py-2.5 font-semibold text-sm cursor-pointer flex items-center justify-between">
                <span>Others</span>
                <ChevronDown className="w-4 h-4" />
              </summary>
              <div className="px-2 pb-2 flex flex-col gap-0.5">
                {othersLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--fg)] hover:bg-[var(--surface2)] no-underline"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </details>

            {!isSignedIn && (
              <div className="flex gap-2.5 pt-3 mt-2 border-t border-[var(--line)]">
                <Link to="/register/" className="dopa-btn ghost flex-1">
                  Sign up
                </Link>
                <Link to="/login/" className="dopa-btn primary flex-1">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main id="app" className="flex-1 relative z-[2]">
        {children}
      </main>

      <footer className="dz mt-20 py-14 border-t border-[#83E5D2]/15 relative z-[2]">
        <div className="wrap">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2.5 no-underline text-[#E8F3F6]">
                <img
                  src="/assets/img/dopa-logo-192.png"
                  alt="DOPA Pakistan"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain shrink-0"
                />
                <span>
                  <span className="block font-display font-bold text-base text-[#E8F3F6]">
                    Doctor of Pharmacy (Pharm.D)
                  </span>
                  <small className="block text-xs text-[#9DB5C4]">Your health companion</small>
                </span>
              </Link>
              <p className="mt-3.5 text-sm text-[#9DB5C4] max-w-[32ch]">
                Your health companion. The association of Pakistan&apos;s Doctors of Pharmacy.
              </p>
              <p className="mt-2.5 text-sm">
                <a href={`tel:${settings.pharmdPhone.replace(/\s+/g, '')}`} className="text-[#83E5D2] no-underline hover:underline">
                  {settings.pharmdPhone}
                </a>
              </p>
            </div>

            <div>
              <h4 className="font-mono-dopa text-xs tracking-widest uppercase text-[#83E5D2] mb-3">
                Doctor of Pharmacy (Pharm.D)
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
                <li><Link to="/about/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">About Doctor of Pharmacy (Pharm.D)</Link></li>
                <li><Link to="/dopa-association/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">DOPA Association</Link></li>
                <li><Link to="/services/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Our services &amp; struggle</Link></li>
                <li><Link to="/universities/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Universities</Link></li>
                <li><Link to="/verify-member/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Verify a member</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono-dopa text-xs tracking-widest uppercase text-[#83E5D2] mb-3">
                Explore
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
                <li><Link to="/shop/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Products</Link></li>
                <li><Link to="/pharmacies/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Registered pharmacies</Link></li>
                <li><Link to="/jobs/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Jobs</Link></li>
                <li><Link to="/community/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Community</Link></li>
                <li><Link to="/videos/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Videos</Link></li>
                <li><Link to="/resources/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Articles &amp; news</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono-dopa text-xs tracking-widest uppercase text-[#83E5D2] mb-3">
                Help and legal
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
                <li><Link to="/register/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Sign up</Link></li>
                <li><Link to="/login/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Sign in</Link></li>
                <li><Link to="/pharmacy-register/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Register your pharmacy</Link></li>
                <li><Link to="/faq/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">FAQ</Link></li>
                <li><Link to="/contact/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Contact</Link></li>
                <li><Link to="/privacy/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Privacy</Link></li>
                <li><Link to="/terms/" className="text-[#B7CCD8] hover:text-[#83E5D2] no-underline">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-6 mt-9 pt-7 border-t border-[#9DB5C4]/20">
            <div>
              <h4 className="font-mono-dopa text-xs tracking-widest uppercase text-[#83E5D2] mb-3">
                Follow Doctor of Pharmacy
              </h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={settings.facebookPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#9DB5C4]/30 bg-white/5 text-[#E8F3F6] text-sm no-underline hover:border-[#83E5D2] hover:text-[#83E5D2]"
                >
                  Facebook page
                </a>
                <a
                  href={settings.facebookGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#9DB5C4]/30 bg-white/5 text-[#E8F3F6] text-sm no-underline hover:border-[#83E5D2] hover:text-[#83E5D2]"
                >
                  Facebook group
                </a>
                <a
                  href={settings.facebookProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#9DB5C4]/30 bg-white/5 text-[#E8F3F6] text-sm no-underline hover:border-[#83E5D2] hover:text-[#83E5D2]"
                >
                  Facebook
                </a>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#9DB5C4]/30 bg-white/5 text-[#E8F3F6] text-sm no-underline hover:border-[#83E5D2] hover:text-[#83E5D2]"
                >
                  Instagram
                </a>
              </div>
            </div>

            <figure className="flex items-center gap-3.5 m-0">
              <img
                src="/assets/img/instagram-qr.png"
                alt={`Instagram QR code for ${settings.instagramHandle}`}
                width={120}
                height={120}
                className="w-28 h-28 rounded-2xl bg-white p-1 block"
              />
              <figcaption className="text-sm text-[#9DB5C4] max-w-[14ch]">
                Scan to follow on Instagram
              </figcaption>
            </figure>
          </div>

          <div className="border-t border-[#9DB5C4]/15 mt-8 pt-5 text-xs text-[#8FA9B8] flex flex-wrap justify-between gap-3">
            <span>&copy; 2026 Doctor of Pharmacy (Pharm.D)</span>
            <span>Your health companion</span>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};
