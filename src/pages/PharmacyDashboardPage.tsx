import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Pill,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Order, OrderStatus, Product } from '../types';
import {
  AuthGate,
  BankDetailsBox,
  EmptyState,
  FileUpload,
  Modal,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { daysRemaining, formatDateShort, formatPKR } from '../lib/formatters';

export const PharmacyDashboardPage: React.FC = () => {
  const {
    currentPharmacy,
    products,
    orders,
    medRequests,
    settings,
    logout,
    upsertProduct,
    deleteProduct,
    updateOrderStatus,
    replyMedicineRequest,
    updatePharmacy,
    adminReviewPharmacy,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [editingProd, setEditingProd] = useState<Partial<Product> | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderTab, setOrderTab] = useState<string>('All');
  const [replyState, setReplyState] = useState<
    Record<string, { available: boolean; price: string; note: string }>
  >({});

  // Profile form state
  const [pName, setPName] = useState(currentPharmacy?.name || '');
  const [pPhone, setPPhone] = useState(currentPharmacy?.phone || '');
  const [pAddress, setPAddress] = useState(currentPharmacy?.address || '');
  const [pMaps, setPMaps] = useState(currentPharmacy?.mapsUrl || '');
  const [bTitle, setBTitle] = useState(currentPharmacy?.bankDetails.accountTitle || '');
  const [bBank, setBBank] = useState(currentPharmacy?.bankDetails.bankName || '');
  const [bIban, setBIban] = useState(currentPharmacy?.bankDetails.iban || '');
  const [bAcct, setBAcct] = useState(currentPharmacy?.bankDetails.accountNumber || '');

  // Renewal payment
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewConfirmed, setRenewConfirmed] = useState(false);
  const [renewRef, setRenewRef] = useState('');

  if (!currentPharmacy) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Pharmacy Dashboard"
            message="Sign in with your Pharmacy Account credentials (or use the demo Alees Pharmacy login) to manage products, orders, and medicine requests."
            redirectTo="/pharmacy-dashboard/"
          />
        </div>
      </div>
    );
  }

  const path = location.pathname;
  const sub =
    path.includes('/products/new')
      ? 'new-product'
      : path.includes('/products')
      ? 'products'
      : path.includes('/orders')
      ? 'orders'
      : path.includes('/requests')
      ? 'requests'
      : path.includes('/profile')
      ? 'profile'
      : path.includes('/membership')
      ? 'membership'
      : 'overview';

  const myProducts = products.filter((p) => p.pharmacyId === currentPharmacy.id);
  const myOrders = orders.filter((o) => o.pharmacyId === currentPharmacy.id);
  const openRequests = medRequests.filter((r) => r.status === 'Open');
  const daysLeft = daysRemaining(currentPharmacy.expiresAt);

  const navItems = [
    { to: '/pharmacy-dashboard/', label: 'Overview', key: 'overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/pharmacy-dashboard/products/', label: 'Products', key: 'products', icon: <Package className="w-4 h-4" /> },
    { to: '/pharmacy-dashboard/orders/', label: 'Orders', key: 'orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/pharmacy-dashboard/requests/', label: 'Medicine requests', key: 'requests', icon: <Pill className="w-4 h-4" /> },
    { to: '/pharmacy-dashboard/profile/', label: 'Profile', key: 'profile', icon: <Building2 className="w-4 h-4" /> },
    { to: '/pharmacy-dashboard/membership/', label: 'Membership', key: 'membership', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd?.name?.trim()) return;
    upsertProduct({
      id: editingProd.id,
      pharmacyId: currentPharmacy.id,
      name: editingProd.name.trim(),
      category: editingProd.category || settings.productCategories[0] || 'Pain Relief',
      description: editingProd.description || '',
      image: editingProd.image || '/assets/uploads/prod-panadol.jpg',
      price: Number(editingProd.price) || 0,
      stock: Number(editingProd.stock) || 0,
      active: editingProd.active ?? true,
    });
    setEditingProd(null);
    if (sub === 'new-product') navigate('/pharmacy-dashboard/products/');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePharmacy(currentPharmacy.id, {
      name: pName.trim() || currentPharmacy.name,
      phone: pPhone.trim() || currentPharmacy.phone,
      address: pAddress.trim() || currentPharmacy.address,
      mapsUrl: pMaps.trim() || undefined,
      bankDetails: {
        accountTitle: bTitle.trim(),
        bankName: bBank.trim(),
        iban: bIban.trim(),
        accountNumber: bAcct.trim(),
      },
    });
  };

  const filteredOrders =
    orderTab === 'All' ? myOrders : myOrders.filter((o) => o.status === orderTab);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Pharmacy Dashboard' }]}
        eyebrow="Pharmacy Dashboard"
        title={currentPharmacy.name}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={currentPharmacy.status} />
            <Link
              to={`/pharmacy/?shop=${encodeURIComponent(currentPharmacy.slug)}`}
              className="dopa-btn sm ghost"
            >
              View public page
            </Link>
          </div>
        }
      />

      <section className="pb-14">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 dopa-card flat !p-2.5 flex lg:flex-col gap-1 overflow-x-auto">
            {navItems.map((it) => {
              const active = sub === it.key || (sub === 'new-product' && it.key === 'products');
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium no-underline whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'text-[var(--fg)] hover:bg-[var(--surface2)]'
                  }`}
                >
                  {it.icon}
                  <span>{it.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--bad)] hover:bg-[var(--badbg)] whitespace-nowrap cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </aside>

          {/* Main panel */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {currentPharmacy.status === 'Pending' && (
              <div className="dopa-notice warn">
                Your pharmacy account is pending admin licence review. Once approved, your products will appear publicly in the Shop.
              </div>
            )}

            {sub === 'overview' && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="dopa-card flat">
                    <div className="text-xs font-mono-dopa uppercase text-[var(--muted)]">Products</div>
                    <div className="font-display font-bold text-3xl mt-1 num">{myProducts.length}</div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs font-mono-dopa uppercase text-[var(--muted)]">Orders</div>
                    <div className="font-display font-bold text-3xl mt-1 num">{myOrders.length}</div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs font-mono-dopa uppercase text-[var(--muted)]">Open requests</div>
                    <div className="font-display font-bold text-3xl mt-1 num">{openRequests.length}</div>
                  </div>
                  <div className="dopa-card flat">
                    <div className="text-xs font-mono-dopa uppercase text-[var(--muted)]">Days left</div>
                    <div className="font-display font-bold text-3xl mt-1 num">{daysLeft}</div>
                  </div>
                </div>

                <div className="dopa-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3>Recent orders</h3>
                    <Link to="/pharmacy-dashboard/orders/" className="text-sm font-semibold">
                      All orders
                    </Link>
                  </div>
                  {myOrders.length === 0 ? (
                    <EmptyState title="No orders yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--line)] text-left text-xs font-mono-dopa uppercase text-[var(--muted)]">
                            <th className="py-2.5 pr-3">Order</th>
                            <th className="py-2.5 pr-3">Customer</th>
                            <th className="py-2.5 pr-3">Total</th>
                            <th className="py-2.5 pr-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myOrders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="border-b border-[var(--line)] last:border-b-0">
                              <td className="py-3 pr-3 font-mono-dopa font-semibold">{o.orderNumber}</td>
                              <td className="py-3 pr-3">{o.buyerName}</td>
                              <td className="py-3 pr-3 font-semibold num">{formatPKR(o.total)}</td>
                              <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {(sub === 'products' || sub === 'new-product') && (
              <div className="dopa-card flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2>Products ({myProducts.length})</h2>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProd({
                        name: '',
                        category: settings.productCategories[0] || 'Pain Relief',
                        description: '',
                        price: 0,
                        stock: 10,
                        active: true,
                      })
                    }
                    className="dopa-btn sm primary"
                  >
                    <Plus className="w-4 h-4" /> Add product
                  </button>
                </div>

                {(editingProd || sub === 'new-product') && (
                  <form
                    onSubmit={handleSaveProduct}
                    className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col gap-4"
                  >
                    <h3>{editingProd?.id ? 'Edit product' : 'Add new product'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold">Product name *</label>
                        <input
                          type="text"
                          className="dopa-input"
                          value={editingProd?.name || ''}
                          onChange={(e) =>
                            setEditingProd((p) => ({ ...p, name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold">Category *</label>
                        <select
                          className="dopa-select"
                          value={editingProd?.category || settings.productCategories[0]}
                          onChange={(e) =>
                            setEditingProd((p) => ({ ...p, category: e.target.value }))
                          }
                        >
                          {settings.productCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold">Price (PKR) *</label>
                        <input
                          type="number"
                          min={1}
                          className="dopa-input"
                          value={editingProd?.price ?? 0}
                          onChange={(e) =>
                            setEditingProd((p) => ({ ...p, price: Number(e.target.value) }))
                          }
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold">Stock *</label>
                        <input
                          type="number"
                          min={0}
                          className="dopa-input"
                          value={editingProd?.stock ?? 0}
                          onChange={(e) =>
                            setEditingProd((p) => ({ ...p, stock: Number(e.target.value) }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">Description</label>
                      <textarea
                        className="dopa-textarea"
                        value={editingProd?.description || ''}
                        onChange={(e) =>
                          setEditingProd((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                    </div>
                    <FileUpload
                      id="ph-prod-img"
                      label="Product image (optional)"
                      accept=".jpg,.jpeg,.png,.webp"
                      fileName={editingProd?.image ? 'Uploaded image' : ''}
                      fileData={editingProd?.image}
                      onFileSelect={(_, d) => setEditingProd((p) => ({ ...p, image: d }))}
                      onClear={() => setEditingProd((p) => ({ ...p, image: '' }))}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="dopa-btn sm primary">
                        Save product
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProd(null);
                          if (sub === 'new-product') navigate('/pharmacy-dashboard/products/');
                        }}
                        className="dopa-btn sm ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {myProducts.length === 0 ? (
                  <EmptyState title="No products listed yet" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--line)] text-left text-xs font-mono-dopa uppercase text-[var(--muted)]">
                          <th className="py-2.5 pr-3">Product</th>
                          <th className="py-2.5 pr-3">Category</th>
                          <th className="py-2.5 pr-3">Price</th>
                          <th className="py-2.5 pr-3">Stock</th>
                          <th className="py-2.5 pr-3">Active</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myProducts.map((p) => (
                          <tr key={p.id} className="border-b border-[var(--line)] last:border-b-0">
                            <td className="py-3 pr-3 font-semibold">{p.name}</td>
                            <td className="py-3 pr-3 text-[var(--muted)]">{p.category}</td>
                            <td className="py-3 pr-3 font-semibold num">{formatPKR(p.price)}</td>
                            <td className="py-3 pr-3 num">{p.stock}</td>
                            <td className="py-3 pr-3">
                              <button
                                type="button"
                                onClick={() => upsertProduct({ ...p, active: !p.active })}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-md cursor-pointer ${
                                  p.active
                                    ? 'bg-[var(--okbg)] text-[var(--ok)]'
                                    : 'bg-[var(--surface2)] text-[var(--muted)]'
                                }`}
                              >
                                {p.active ? 'Active' : 'Hidden'}
                              </button>
                            </td>
                            <td className="py-3 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingProd(p)}
                                  className="dopa-btn sm ghost"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-2 text-[var(--bad)] hover:bg-[var(--badbg)] rounded-lg cursor-pointer"
                                  aria-label={`Delete ${p.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {sub === 'orders' && (
              <div className="dopa-card flex flex-col gap-5">
                <h2>Orders</h2>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'All',
                    'Waiting for payment confirmation',
                    'Payment confirmed',
                    'Dispatched',
                    'Delivered',
                    'Cancelled',
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderTab(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                        orderTab === st
                          ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                          : 'bg-[var(--surface2)] text-[var(--fg)] border-[var(--line)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {filteredOrders.length === 0 ? (
                  <EmptyState title="No orders in this status" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <b className="font-mono-dopa">{o.orderNumber}</b>
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="text-sm mt-1">
                            {o.buyerName} &middot; {o.buyerCity} &middot;{' '}
                            <span className="num font-bold">{formatPKR(o.total)}</span>
                          </div>
                          <div className="text-xs text-[var(--muted)] mt-0.5">
                            Transfer ref: <span className="font-mono-dopa">{o.paymentRef}</span> &middot;{' '}
                            {formatDateShort(o.createdAt)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="dopa-btn sm primary"
                        >
                          Manage order
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Modal
                  open={Boolean(selectedOrder)}
                  onClose={() => setSelectedOrder(null)}
                  title={`Order ${selectedOrder?.orderNumber || ''}`}
                >
                  {selectedOrder && (
                    <div className="flex flex-col gap-4 text-sm">
                      <div>
                        <div className="text-xs text-[var(--muted)]">Buyer &amp; delivery</div>
                        <div className="font-semibold">{selectedOrder.buyerName} ({selectedOrder.buyerPhone})</div>
                        <div>{selectedOrder.deliveryAddress}, {selectedOrder.buyerCity}</div>
                        {selectedOrder.notes && <div className="text-xs text-[var(--muted)] mt-1">Notes: {selectedOrder.notes}</div>}
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--surface2)]">
                        <div className="text-xs text-[var(--muted)] mb-1">Items</div>
                        {selectedOrder.items.map((it) => (
                          <div key={it.productId} className="flex justify-between">
                            <span>{it.name} &times; {it.quantity}</span>
                            <span className="num font-semibold">{formatPKR(it.price * it.quantity)}</span>
                          </div>
                        ))}
                        <div className="border-t border-[var(--line)] mt-2 pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span className="num">{formatPKR(selectedOrder.total)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted)]">Payment reference</div>
                        <div className="font-mono-dopa font-semibold">{selectedOrder.paymentRef}</div>
                        {selectedOrder.receiptFileName && (
                          <div className="text-xs text-[var(--ok)] mt-1">
                            Receipt attached: {selectedOrder.receiptFileName}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--line)]">
                        {(
                          [
                            'Payment confirmed',
                            'Dispatched',
                            'Delivered',
                            'Cancelled',
                          ] as OrderStatus[]
                        ).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              updateOrderStatus(selectedOrder.id, st);
                              setSelectedOrder({ ...selectedOrder, status: st });
                            }}
                            className={`dopa-btn sm ${
                              st === 'Cancelled' ? 'danger' : 'primary'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Modal>
              </div>
            )}

            {sub === 'requests' && (
              <div className="dopa-card flex flex-col gap-5">
                <h2>Incoming Medicine Requests</h2>
                {openRequests.length === 0 ? (
                  <EmptyState title="No open medicine requests right now" />
                ) : (
                  <div className="flex flex-col gap-4">
                    {openRequests.map((req) => {
                      const alreadyReplied = req.replies.some(
                        (r) => r.pharmacyId === currentPharmacy.id
                      );
                      const form = replyState[req.id] || {
                        available: true,
                        price: '',
                        note: '',
                      };

                      return (
                        <div
                          key={req.id}
                          className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex flex-col gap-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-base font-bold">
                                {req.medicineName} ({req.strengthForm})
                              </h3>
                              <div className="text-xs text-[var(--muted)]">
                                Qty: {req.quantity} &middot; City: {req.city} &middot; Requested by {req.userName} ({formatDateShort(req.createdAt)})
                              </div>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                          {req.notes && <p className="text-xs text-[var(--muted)]">Note: {req.notes}</p>}
                          <div className="text-xs">
                            Prescription: <span className="font-mono-dopa">{req.prescriptionFileName}</span>
                          </div>

                          {alreadyReplied ? (
                            <div className="dopa-notice ok text-xs">
                              You have already replied to this request.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[var(--line)] items-end">
                              <div>
                                <label className="text-xs font-semibold block mb-1">Availability</label>
                                <select
                                  className="dopa-select !min-h-[38px]"
                                  value={form.available ? 'yes' : 'no'}
                                  onChange={(e) =>
                                    setReplyState((prev) => ({
                                      ...prev,
                                      [req.id]: { ...form, available: e.target.value === 'yes' },
                                    }))
                                  }
                                >
                                  <option value="yes">Available</option>
                                  <option value="no">Not available</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-semibold block mb-1">Price (PKR)</label>
                                <input
                                  type="number"
                                  className="dopa-input !min-h-[38px]"
                                  placeholder="e.g. 1200"
                                  disabled={!form.available}
                                  value={form.price}
                                  onChange={(e) =>
                                    setReplyState((prev) => ({
                                      ...prev,
                                      [req.id]: { ...form, price: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                              <div className="sm:col-span-2 flex gap-2">
                                <input
                                  type="text"
                                  className="dopa-input !min-h-[38px]"
                                  placeholder="Note (delivery/branch info)..."
                                  value={form.note}
                                  onChange={(e) =>
                                    setReplyState((prev) => ({
                                      ...prev,
                                      [req.id]: { ...form, note: e.target.value },
                                    }))
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    replyMedicineRequest(req.id, {
                                      pharmacyId: currentPharmacy.id,
                                      pharmacyName: currentPharmacy.name,
                                      pharmacyCity: currentPharmacy.city,
                                      pharmacyPhone: currentPharmacy.phone,
                                      available: form.available,
                                      price: form.available && form.price ? Number(form.price) : undefined,
                                      note: form.note || (form.available ? 'Available at pharmacy.' : 'Currently out of stock.'),
                                    })
                                  }
                                  className="dopa-btn sm primary"
                                >
                                  Send reply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {sub === 'profile' && (
              <form onSubmit={handleSaveProfile} className="dopa-card flex flex-col gap-4">
                <h2>Pharmacy Profile &amp; Customer Bank Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Pharmacy name</label>
                    <input className="dopa-input" value={pName} onChange={(e) => setPName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Phone</label>
                    <input className="dopa-input" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold">Full address</label>
                    <input className="dopa-input" value={pAddress} onChange={(e) => setPAddress(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold">Google Maps share link</label>
                    <input className="dopa-input" value={pMaps} onChange={(e) => setPMaps(e.target.value)} />
                  </div>
                </div>

                <h3 className="pt-3 border-t border-[var(--line)]">Customer Bank Transfer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Account title</label>
                    <input className="dopa-input" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Bank name</label>
                    <input className="dopa-input" value={bBank} onChange={(e) => setBBank(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">IBAN</label>
                    <input className="dopa-input font-mono-dopa" value={bIban} onChange={(e) => setBIban(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Account number</label>
                    <input className="dopa-input font-mono-dopa" value={bAcct} onChange={(e) => setBAcct(e.target.value)} />
                  </div>
                </div>
                <div>
                  <button type="submit" className="dopa-btn primary">
                    Save profile &amp; bank details
                  </button>
                </div>
              </form>
            )}

            {sub === 'membership' && (
              <div className="dopa-card flex flex-col gap-4">
                <h2>Pharmacy Annual Membership</h2>
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface2)]">
                  <div>
                    <div className="font-bold text-lg">{formatPKR(settings.pharmacyFee)} / 12 months</div>
                    <div className="text-xs text-[var(--muted)] mt-0.5">
                      Expires: {currentPharmacy.expiresAt ? formatDateShort(currentPharmacy.expiresAt) : 'Upon approval'} ({daysLeft} days left)
                    </div>
                  </div>
                  <StatusBadge status={currentPharmacy.status} />
                </div>

                {!renewOpen ? (
                  <div>
                    <button type="button" onClick={() => setRenewOpen(true)} className="dopa-btn primary">
                      Renew membership
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <BankDetailsBox
                      bank={settings.pharmacyBank}
                      amount={settings.pharmacyFee}
                      remarkInstruction={`Pharmacy renewal - ${currentPharmacy.name}`}
                      confirmed={renewConfirmed}
                      onToggleConfirm={() => setRenewConfirmed(true)}
                      paymentRef={renewRef}
                      onPaymentRefChange={setRenewRef}
                      onReceiptSelect={() => {}}
                      onReceiptClear={() => {}}
                    />
                    {renewConfirmed && renewRef.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          updatePharmacy(currentPharmacy.id, { paidRef: renewRef.trim() });
                          adminReviewPharmacy(currentPharmacy.id, 'Renew');
                          setRenewOpen(false);
                        }}
                        className="dopa-btn primary self-start"
                      >
                        Submit renewal payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
