import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Phone,
  Pill,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  AuthGate,
  BankDetailsBox,
  EmptyState,
  PageHeader,
  QuantityStepper,
} from '../components/ui';
import { formatPKR } from '../lib/formatters';

/* ================= M7.1 SHOP LISTING (/shop/) ================= */
export const ShopPage: React.FC = () => {
  const { products, pharmacies, settings, addToCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [kw, setKw] = useState(searchParams.get('q') || '');
  const [cat, setCat] = useState(searchParams.get('cat') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const perPage = 8;

  const approvedPharmacies = useMemo(
    () => pharmacies.filter((p) => p.status === 'Approved'),
    [pharmacies]
  );

  const cities = useMemo(
    () => Array.from(new Set(approvedPharmacies.map((p) => p.city))).sort(),
    [approvedPharmacies]
  );

  const filtered = useMemo(() => {
    const qParam = searchParams.get('q') || '';
    const cParam = searchParams.get('cat') || 'All';
    const cityParam = searchParams.get('city') || 'All';

    return products.filter((prod) => {
      if (!prod.active) return false;
      const ph = approvedPharmacies.find((p) => p.id === prod.pharmacyId);
      if (!ph) return false;
      if (cParam !== 'All' && prod.category !== cParam) return false;
      if (cityParam !== 'All' && ph.city !== cityParam) return false;
      if (qParam.trim()) {
        const s = qParam.toLowerCase();
        return (
          prod.name.toLowerCase().includes(s) ||
          prod.description.toLowerCase().includes(s) ||
          ph.name.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [products, approvedPharmacies, searchParams]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (kw.trim()) next.q = kw.trim();
    if (cat !== 'All') next.cat = cat;
    if (city !== 'All') next.city = city;
    setSearchParams(next);
    setPage(1);
  };

  const clearFilters = () => {
    setKw('');
    setCat('All');
    setCity('All');
    setSearchParams({});
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Shop' }]}
        eyebrow="Shop"
        title="Shop products"
        intro="Products from admin-approved pharmacies. Each order is fulfilled by one pharmacy and paid to that pharmacy by bank transfer."
      />

      <section className="pb-14">
        <div className="wrap flex flex-col gap-6">
          <div className="dopa-card flat bg-[var(--surface2)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Pill className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span className="text-sm font-medium">
                Can&apos;t find a medicine? Request it from all registered pharmacies with your prescription.
              </span>
            </div>
            <Link to="/request-medicine/" className="dopa-btn sm primary">
              Request a medicine
            </Link>
          </div>

          <form
            onSubmit={handleFilter}
            className="dopa-card flat grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sh-kw" className="text-xs font-semibold">
                Search
              </label>
              <input
                id="sh-kw"
                type="search"
                className="dopa-input"
                placeholder="Medicine or pharmacy name..."
                value={kw}
                onChange={(e) => setKw(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sh-cat" className="text-xs font-semibold">
                Category
              </label>
              <select
                id="sh-cat"
                className="dopa-select"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="All">All categories</option>
                {settings.productCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sh-city" className="text-xs font-semibold">
                City
              </label>
              <select
                id="sh-city"
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

            <div className="flex gap-2">
              <button type="submit" className="dopa-btn primary flex-1">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </form>

          <div className="text-sm font-semibold text-[var(--muted)] num">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </div>

          {paged.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-6 h-6" />}
              title="No products match those filters"
              description="Clear a filter or request your medicine directly from all registered pharmacies."
              action={
                <div className="flex gap-2">
                  <button type="button" onClick={clearFilters} className="dopa-btn sm primary">
                    Clear filters
                  </button>
                  <Link to="/request-medicine/" className="dopa-btn sm ghost">
                    Request a medicine
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {paged.map((prod) => {
                const ph = approvedPharmacies.find((p) => p.id === prod.pharmacyId);
                const qty = qtyMap[prod.id] || 1;
                return (
                  <article key={prod.id} className="dopa-card hov flex flex-col gap-3 !p-4">
                    <Link to={`/product/${prod.slug}/`} className="block">
                      <img
                        src={prod.image || '/assets/uploads/prod-panadol.jpg'}
                        alt={prod.name}
                        className="w-full aspect-[4/3] object-cover rounded-xl bg-[var(--surface2)]"
                      />
                    </Link>
                    <div className="text-xs text-[var(--muted)]">{prod.category}</div>
                    <h3 className="text-base font-bold leading-snug">
                      <Link
                        to={`/product/${prod.slug}/`}
                        className="text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                      >
                        {prod.name}
                      </Link>
                    </h3>
                    <div className="text-xs text-[var(--muted)]">
                      by{' '}
                      <Link
                        to={`/pharmacy/?shop=${encodeURIComponent(ph?.slug || '')}`}
                        className="font-medium hover:underline"
                      >
                        {ph?.name}
                      </Link>
                      , {ph?.city}
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 flex-1">
                      {prod.description}
                    </p>
                    <div className="font-bold text-lg num">{formatPKR(prod.price)}</div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <QuantityStepper
                        value={qty}
                        max={prod.stock}
                        onChange={(v) => setQtyMap((prev) => ({ ...prev, [prod.id]: v }))}
                      />
                      <button
                        type="button"
                        onClick={() => addToCart(prod.id, qty)}
                        disabled={prod.stock <= 0}
                        className="dopa-btn sm primary"
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`px-3.5 py-1.5 rounded-lg border text-sm font-semibold cursor-pointer ${
                    p === page
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                      : 'border-[var(--line)] bg-[var(--surface)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M7.2 PRODUCT DETAIL (/product/:slug/) ================= */
export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, pharmacies, addToCart } = useApp();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.slug === slug);
  const pharmacy = product ? pharmacies.find((ph) => ph.id === product.pharmacyId) : null;

  if (!product || !pharmacy) {
    return (
      <div className="py-14">
        <div className="wrap max-w-2xl">
          <EmptyState
            title="Product not found"
            action={
              <Link to="/shop/" className="dopa-btn sm primary">
                Back to shop
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const moreFromPharmacy = products
    .filter((p) => p.pharmacyId === pharmacy.id && p.id !== product.id && p.active)
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop/' },
          { label: product.name },
        ]}
        eyebrow={product.category}
        title={product.name}
      />

      <section className="pb-14">
        <div className="wrap flex flex-col gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 dopa-card !p-3">
              <img
                src={product.image || '/assets/uploads/prod-panadol.jpg'}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover rounded-xl bg-[var(--surface2)]"
              />
            </div>

            <div className="lg:col-span-6 dopa-card flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-display font-extrabold text-3xl num">
                  {formatPKR(product.price)}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    product.stock > 0
                      ? 'bg-[var(--okbg)] text-[var(--ok)]'
                      : 'bg-[var(--badbg)] text-[var(--bad)]'
                  }`}
                >
                  {product.stock > 0 ? `In stock (${product.stock} units)` : 'Out of stock'}
                </span>
              </div>

              <p className="text-[var(--muted)] leading-relaxed">{product.description}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <QuantityStepper value={qty} max={Math.max(1, product.stock)} onChange={setQty} />
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => addToCart(product.id, qty)}
                  className="dopa-btn primary"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to cart
                </button>
                <Link to="/cart/" className="dopa-btn ghost">
                  View cart
                </Link>
              </div>

              <div className="mt-2 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[var(--surface2)] text-[var(--accent)] grid place-items-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{pharmacy.name}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {pharmacy.city} &middot; Verified Pharmacy
                    </div>
                  </div>
                </div>
                <Link
                  to={`/pharmacy/?shop=${encodeURIComponent(pharmacy.slug)}`}
                  className="dopa-btn sm ghost"
                >
                  Visit pharmacy
                </Link>
              </div>
            </div>
          </div>

          {moreFromPharmacy.length > 0 && (
            <div>
              <h2 className="mb-4">More from {pharmacy.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {moreFromPharmacy.map((mp) => (
                  <Link
                    key={mp.id}
                    to={`/product/${mp.slug}/`}
                    className="dopa-card hov !p-4 no-underline text-[var(--fg)] flex flex-col gap-2"
                  >
                    <img
                      src={mp.image || '/assets/uploads/prod-panadol.jpg'}
                      alt={mp.name}
                      className="w-full aspect-[4/3] object-cover rounded-xl bg-[var(--surface2)]"
                    />
                    <div className="font-bold text-sm">{mp.name}</div>
                    <div className="font-bold num text-[var(--accent)]">{formatPKR(mp.price)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M7.3 CART (/cart/) ================= */
export const CartPage: React.FC = () => {
  const { cart, products, pharmacies, updateCartQty, removeFromCart } = useApp();

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        pharmacy: NonNullable<(typeof pharmacies)[number]>;
        items: { product: NonNullable<(typeof products)[number]>; quantity: number }[];
        total: number;
      }
    >();

    cart.forEach((ci) => {
      const prod = products.find((p) => p.id === ci.productId);
      const ph = pharmacies.find((p) => p.id === ci.pharmacyId);
      if (!prod || !ph) return;
      if (!map.has(ph.id)) {
        map.set(ph.id, { pharmacy: ph, items: [], total: 0 });
      }
      const entry = map.get(ph.id)!;
      entry.items.push({ product: prod, quantity: ci.quantity });
      entry.total += prod.price * ci.quantity;
    });

    return Array.from(map.values());
  }, [cart, products, pharmacies]);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop/' },
          { label: 'Cart' },
        ]}
        eyebrow="Cart"
        title="Shopping cart"
        intro="Items are grouped by pharmacy — each order is fulfilled by one pharmacy and paid directly by bank transfer."
      />

      <section className="pb-14">
        <div className="wrap max-w-4xl flex flex-col gap-6">
          {grouped.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-6 h-6" />}
              title="Your cart is empty"
              description="Browse products from verified pharmacies across Pakistan."
              action={
                <Link to="/shop/" className="dopa-btn primary">
                  Continue shopping
                </Link>
              }
            />
          ) : (
            grouped.map((grp) => (
              <div key={grp.pharmacy.id} className="dopa-card flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                  <div>
                    <div className="eyebrow">Pharmacy order</div>
                    <h2 className="text-xl font-bold mt-0.5">
                      {grp.pharmacy.name} &middot; {grp.pharmacy.city}
                    </h2>
                  </div>
                  <Link
                    to={`/pharmacy/?shop=${encodeURIComponent(grp.pharmacy.slug)}`}
                    className="text-xs font-semibold"
                  >
                    View pharmacy
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  {grp.items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-dashed border-[var(--line)] last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={product.image || '/assets/uploads/prod-panadol.jpg'}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover bg-[var(--surface2)] shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/product/${product.slug}/`}
                            className="font-semibold text-sm text-[var(--fg)] hover:text-[var(--accent)] no-underline block truncate"
                          >
                            {product.name}
                          </Link>
                          <div className="text-xs text-[var(--muted)] num mt-0.5">
                            {formatPKR(product.price)} each
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <QuantityStepper
                          value={quantity}
                          max={product.stock}
                          onChange={(q) => updateCartQty(product.id, q)}
                        />
                        <div className="font-bold text-sm num min-w-[90px] text-right">
                          {formatPKR(product.price * quantity)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name}`}
                          className="p-2 text-[var(--bad)] hover:bg-[var(--badbg)] rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--line)]">
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Pharmacy total</span>
                    <span className="font-display font-extrabold text-2xl num">
                      {formatPKR(grp.total)}
                    </span>
                  </div>
                  <Link
                    to={`/checkout/?shop=${encodeURIComponent(grp.pharmacy.slug)}`}
                    className="dopa-btn primary"
                  >
                    Checkout this pharmacy
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

/* ================= M7.4 CHECKOUT (/checkout/?shop=) ================= */
export const CheckoutPage: React.FC = () => {
  const { currentUser, cart, products, pharmacies, placeOrder } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shopSlug = searchParams.get('shop') || '';

  const pharmacy = pharmacies.find((p) => p.slug === shopSlug) || null;
  const shopCart = useMemo(() => {
    if (!pharmacy) return [];
    return cart
      .filter((c) => c.pharmacyId === pharmacy.id)
      .map((ci) => {
        const prod = products.find((p) => p.id === ci.productId);
        return prod ? { product: prod, quantity: ci.quantity } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, pharmacy, products]);

  const total = shopCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmedPay, setConfirmedPay] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptData, setReceiptData] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Sign in to checkout"
            message="Please sign in or create a free account so you can track your order and payment status."
          />
        </div>
      </div>
    );
  }

  if (!pharmacy || shopCart.length === 0) {
    return (
      <div className="py-12">
        <div className="wrap max-w-2xl">
          <EmptyState
            title="No checkout items for this pharmacy"
            action={
              <Link to="/cart/" className="dopa-btn sm primary">
                Return to cart
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError('Full name is required.');
    if (!phone.trim()) return setError('Phone number is required.');
    if (!city.trim()) return setError('City is required.');
    if (!address.trim()) return setError('Full delivery address is required.');
    if (!confirmedPay || !paymentRef.trim()) {
      return setError('Please transfer the exact amount, click "Confirm payment", and enter your transfer reference.');
    }

    const order = placeOrder({
      pharmacyId: pharmacy.id,
      buyerName: fullName.trim(),
      buyerPhone: phone.trim(),
      buyerCity: city.trim(),
      deliveryAddress: address.trim(),
      notes: notes.trim() || undefined,
      paymentRef: paymentRef.trim(),
      receiptFileName: receiptName || undefined,
      receiptFileData: receiptData || undefined,
    });

    if (order) {
      navigate(`/order-success/${order.id}`);
    }
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart/' },
          { label: `Checkout (${pharmacy.name})` },
        ]}
        eyebrow="Checkout"
        title={`Checkout — ${pharmacy.name}`}
        intro="Complete delivery details and pay the pharmacy directly by bank transfer."
      />

      <section className="pb-14">
        <form onSubmit={handlePlaceOrder} className="wrap grid grid-cols-1 lg:grid-cols-12 gap-7 items-start" noValidate>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="dopa-card flex flex-col gap-4">
              <h2>1. Delivery details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="co-name" className="text-sm font-semibold">
                    Full name <span className="text-[var(--bad)]">*</span>
                  </label>
                  <input
                    id="co-name"
                    type="text"
                    className="dopa-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="co-phone" className="text-sm font-semibold">
                    Phone <span className="text-[var(--bad)]">*</span>
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    className="dopa-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="co-city" className="text-sm font-semibold">
                  City <span className="text-[var(--bad)]">*</span>
                </label>
                <input
                  id="co-city"
                  type="text"
                  className="dopa-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="co-addr" className="text-sm font-semibold">
                  Full delivery address <span className="text-[var(--bad)]">*</span>
                </label>
                <textarea
                  id="co-addr"
                  className="dopa-textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="co-notes" className="text-sm font-semibold">
                  Delivery notes (optional)
                </label>
                <input
                  id="co-notes"
                  type="text"
                  className="dopa-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <BankDetailsBox
              bank={pharmacy.bankDetails}
              amount={total}
              remarkInstruction={`Order for ${pharmacy.name} - ${fullName || 'Customer'}`}
              confirmed={confirmedPay}
              onToggleConfirm={() => setConfirmedPay(true)}
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
          </div>

          <div className="lg:col-span-5 dopa-card flex flex-col gap-4 lg:sticky lg:top-32">
            <h2>2. Order summary</h2>
            <div className="flex flex-col gap-2.5 text-sm">
              {shopCart.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-3">
                  <span>
                    {product.name} <span className="text-[var(--muted)]">&times; {quantity}</span>
                  </span>
                  <span className="font-semibold num whitespace-nowrap">
                    {formatPKR(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-[var(--line)] flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="font-display font-extrabold text-2xl num">{formatPKR(total)}</span>
            </div>
            {error && <div className="dopa-notice bad text-sm">{error}</div>}
            <button type="submit" className="dopa-btn primary w-full">
              Place order
            </button>
            <Link to="/cart/" className="inline-flex items-center gap-1 text-xs font-semibold justify-center">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to cart
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};

/* ================= M7.5 ORDER SUCCESS (/order-success/:id) ================= */
export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, pharmacies } = useApp();
  const order = orders.find((o) => o.id === id);
  const pharmacy = order ? pharmacies.find((p) => p.id === order.pharmacyId) : null;

  if (!order) {
    return (
      <div className="py-14">
        <div className="wrap max-w-2xl">
          <EmptyState
            title="Order not found"
            action={
              <Link to="/shop/" className="dopa-btn sm primary">
                Go to shop
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-14">
      <div className="wrap max-w-xl">
        <div className="dopa-card text-center flex flex-col items-center gap-4 py-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--okbg)] text-[var(--ok)] grid place-items-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="eyebrow">Order placed</div>
          <h1>Order {order.orderNumber}</h1>
          <div className="px-3 py-1 rounded-md bg-[var(--warnbg)] text-[var(--warn)] text-sm font-semibold">
            {order.status}
          </div>
          <p className="text-sm text-[var(--muted)] max-w-md">
            Your order total of <b className="num text-[var(--fg)]">{formatPKR(order.total)}</b> (Ref: <span className="font-mono-dopa">{order.paymentRef}</span>) has been sent to <b>{order.pharmacyName}</b>.
          </p>
          {pharmacy && (
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] text-sm w-full flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-[var(--accent)]" />
              <span>
                Pharmacy contact: <b>{pharmacy.phone}</b> ({pharmacy.city})
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            <Link to="/account/orders/" className="dopa-btn primary">
              View My Orders
            </Link>
            <Link to="/shop/" className="dopa-btn ghost">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
