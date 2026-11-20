import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Article,
  AuthSession,
  CartItem,
  CommunityPost,
  ContactMessage,
  DopaMembership,
  FaqItem,
  Job,
  LifePartnerProfile,
  LifePartnerRequest,
  MedicineRequest,
  NewsSlide,
  NotificationItem,
  Order,
  OrderStatus,
  Pharmacy,
  Product,
  RawMaterial,
  RmOrder,
  RmSeller,
  SiteSettings,
  University,
  User,
  VideoItem,
} from '../types';
import { DopaStoreSnapshot, initializeStore, KEYS, storageService } from '../services/storage';
import { generateId, slugify } from '../lib/formatters';

export interface ToastMessage {
  id: string;
  type: 'ok' | 'bad' | 'warn' | 'info';
  text: string;
}

interface AppContextValue extends DopaStoreSnapshot {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  pushToast: (text: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Derived auth
  currentUser: User | null;
  currentPharmacy: Pharmacy | null;
  currentMembership: DopaMembership | null;
  isActiveDopaMember: boolean;
  currentSeller: RmSeller | null;
  isApprovedSeller: boolean;
  currentLpProfile: LifePartnerProfile | null;
  isApprovedLpMember: boolean;
  isAdmin: boolean;
  unreadNotificationsCount: number;
  cartCount: number;

  // Auth actions
  login: (email: string, password: string, kind?: 'auto' | 'user' | 'pharmacy') => { ok: boolean; error?: string; kind?: 'user' | 'pharmacy' };
  registerUser: (payload: Omit<User, 'id' | 'role' | 'createdAt'>) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  updateUserProfile: (patch: Partial<User>) => void;
  changePassword: (currentPw: string, newPw: string) => { ok: boolean; error?: string };

  // Cart & Shop actions
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearPharmacyCart: (pharmacyId: string) => void;
  placeOrder: (payload: {
    pharmacyId: string;
    buyerName: string;
    buyerPhone: string;
    buyerCity: string;
    deliveryAddress: string;
    notes?: string;
    paymentRef: string;
    receiptFileName?: string;
    receiptFileData?: string;
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // DOPA Membership actions
  applyDopaMembership: (payload: Omit<DopaMembership, 'id' | 'memberNo' | 'status' | 'submittedAt'>) => { ok: boolean; error?: string; membership?: DopaMembership };
  renewDopaMembership: (membershipId: string) => void;
  adminReviewMembership: (membershipId: string, decision: 'Approved' | 'Rejected' | 'Revoked' | 'Renew', reason?: string) => void;

  // Pharmacy actions
  registerPharmacy: (payload: Omit<Pharmacy, 'id' | 'slug' | 'status' | 'submittedAt'>) => { ok: boolean; error?: string; pharmacy?: Pharmacy };
  updatePharmacy: (pharmacyId: string, patch: Partial<Pharmacy>) => void;
  adminReviewPharmacy: (pharmacyId: string, decision: 'Approved' | 'Rejected' | 'Renew') => void;
  upsertProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt'> & { id?: string }) => void;
  deleteProduct: (productId: string) => void;

  // Medicine requests
  createMedicineRequest: (payload: Omit<MedicineRequest, 'id' | 'status' | 'replies' | 'createdAt'>) => MedicineRequest;
  replyMedicineRequest: (requestId: string, reply: Omit<MedicineRequest['replies'][number], 'id' | 'repliedAt'>) => void;
  closeMedicineRequest: (requestId: string) => void;

  // Raw materials
  applyRmSeller: (payload: Omit<RmSeller, 'id' | 'status' | 'submittedAt'>) => RmSeller;
  adminReviewSeller: (sellerId: string, decision: 'Approved' | 'Rejected') => void;
  upsertRawMaterial: (material: Omit<RawMaterial, 'id' | 'slug' | 'createdAt'> & { id?: string }) => void;
  deleteRawMaterial: (materialId: string) => void;
  placeRmOrder: (payload: Omit<RmOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => RmOrder;
  updateRmOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Jobs
  postJob: (payload: Omit<Job, 'id' | 'slug' | 'status' | 'postedAt'>) => Job;
  updateJob: (jobId: string, patch: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;

  // Life partner
  saveLpProfile: (payload: Omit<LifePartnerProfile, 'id' | 'status' | 'paymentStatus' | 'createdAt'> & { id?: string }) => LifePartnerProfile;
  submitLpPayment: (profileId: string, paymentRef: string, receiptFileName?: string, receiptFileData?: string) => void;
  adminReviewLpProfile: (profileId: string, status: 'Approved' | 'Rejected', paymentStatus?: LifePartnerProfile['paymentStatus']) => void;
  sendLpRequest: (toProfileId: string, message?: string) => void;
  respondLpRequest: (requestId: string, status: 'Accepted' | 'Declined') => void;

  // Community & Videos
  createPost: (payload: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'status'>) => CommunityPost;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, body: string) => void;
  adminModeratePost: (postId: string, action: 'approve' | 'pin' | 'delete') => void;
  shareVideo: (payload: Omit<VideoItem, 'id' | 'createdAt' | 'status'>) => VideoItem;
  adminModerateVideo: (videoId: string, action: 'approve' | 'delete') => void;

  // Content, Contact, Notifications, Settings
  submitContactMessage: (payload: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>) => void;
  markMessageRead: (msgId: string, read: boolean) => void;
  markNotificationRead: (notId: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  setSlides: (slides: NewsSlide[]) => void;
  upsertArticle: (article: Omit<Article, 'id'> & { id?: string }) => void;
  deleteArticle: (articleId: string) => void;
  upsertFaq: (faq: Omit<FaqItem, 'id'> & { id?: string }) => void;
  deleteFaq: (faqId: string) => void;
  upsertUniversity: (uni: Omit<University, 'id'> & { id?: string }) => void;
  deleteUniversity: (uniId: string) => void;
  adminUpdateUser: (userId: string, patch: Partial<User>) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<DopaStoreSnapshot>(() => initializeStore());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.getTheme());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      storageService.setTheme(next);
      return next;
    });
  }, []);

  const pushToast = useCallback((text: string, type: ToastMessage['type'] = 'ok') => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, text, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateKey = useCallback(
    <K extends keyof DopaStoreSnapshot & keyof typeof KEYS>(key: K, updater: (prev: DopaStoreSnapshot[K]) => DopaStoreSnapshot[K]) => {
      setStore((prev) => {
        const nextVal = updater(prev[key]);
        storageService.saveCollection(key, nextVal);
        return { ...prev, [key]: nextVal };
      });
    },
    []
  );

  const addNotification = useCallback(
    (userId: string, title: string, body: string, link?: string) => {
      const item: NotificationItem = {
        id: generateId('not'),
        userId,
        title,
        body,
        link,
        read: false,
        createdAt: new Date().toISOString(),
      };
      updateKey('notifications', (prev) => [item, ...prev]);
    },
    [updateKey]
  );

  // Derived Auth
  const currentUser = useMemo(() => {
    if (store.session?.kind !== 'user') return null;
    return store.users.find((u) => u.id === store.session?.id && !u.blocked) || null;
  }, [store.session, store.users]);

  const currentPharmacy = useMemo(() => {
    if (store.session?.kind !== 'pharmacy') return null;
    return store.pharmacies.find((p) => p.id === store.session?.id) || null;
  }, [store.session, store.pharmacies]);

  const currentMembership = useMemo(() => {
    if (!currentUser) return null;
    return store.memberships.find((m) => m.userId === currentUser.id) || null;
  }, [currentUser, store.memberships]);

  const isActiveDopaMember = useMemo(() => {
    if (!currentMembership) return false;
    if (currentMembership.status !== 'Approved') return false;
    if (currentMembership.expiresAt && new Date(currentMembership.expiresAt).getTime() < Date.now()) {
      return false;
    }
    return true;
  }, [currentMembership]);

  const currentSeller = useMemo(() => {
    if (!currentUser) return null;
    return store.sellers.find((s) => s.userId === currentUser.id) || null;
  }, [currentUser, store.sellers]);

  const isApprovedSeller = currentSeller?.status === 'Approved';

  const currentLpProfile = useMemo(() => {
    if (!currentUser) return null;
    return store.lpProfiles.find((p) => p.userId === currentUser.id) || null;
  }, [currentUser, store.lpProfiles]);

  const isApprovedLpMember =
    currentLpProfile?.status === 'Approved' && currentLpProfile?.paymentStatus === 'Approved';

  const isAdmin = currentUser?.role === 'admin';

  const activeAccountId = currentUser?.id || currentPharmacy?.id || '';

  const unreadNotificationsCount = useMemo(() => {
    if (!activeAccountId) return 0;
    return store.notifications.filter(
      (n) => !n.read && (n.userId === activeAccountId || n.userId === 'ALL')
    ).length;
  }, [store.notifications, activeAccountId]);

  const cartCount = useMemo(
    () => store.cart.reduce((sum, item) => sum + item.quantity, 0),
    [store.cart]
  );

  // Auth Actions
  const login = useCallback(
    (email: string, password: string, kind: 'auto' | 'user' | 'pharmacy' = 'auto') => {
      const cleanEmail = email.trim().toLowerCase();
      if (kind === 'auto' || kind === 'user') {
        const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (user) {
          if (user.blocked) {
            return { ok: false, error: 'This account has been suspended by the administrator.' };
          }
          if (user.password !== password) {
            return { ok: false, error: 'Incorrect email or password.' };
          }
          const session: AuthSession = { kind: 'user', id: user.id };
          updateKey('session', () => session);
          pushToast(`Welcome back, ${user.name}`);
          return { ok: true, kind: 'user' as const };
        }
      }
      if (kind === 'auto' || kind === 'pharmacy') {
        const ph = store.pharmacies.find((p) => p.email.toLowerCase() === cleanEmail);
        if (ph) {
          if (ph.password !== password) {
            return { ok: false, error: 'Incorrect pharmacy email or password.' };
          }
          const session: AuthSession = { kind: 'pharmacy', id: ph.id };
          updateKey('session', () => session);
          pushToast(`Signed in to ${ph.name} dashboard`);
          return { ok: true, kind: 'pharmacy' as const };
        }
      }
      return { ok: false, error: 'No account found with that email address.' };
    },
    [store.users, store.pharmacies, updateKey, pushToast]
  );

  const registerUser = useCallback(
    (payload: Omit<User, 'id' | 'role' | 'createdAt'>) => {
      const cleanEmail = payload.email.trim().toLowerCase();
      const existsUser = store.users.some((u) => u.email.toLowerCase() === cleanEmail);
      const existsPh = store.pharmacies.some((p) => p.email.toLowerCase() === cleanEmail);
      if (existsUser || existsPh) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const user: User = {
        ...payload,
        email: cleanEmail,
        id: generateId('usr'),
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      updateKey('users', (prev) => [user, ...prev]);
      updateKey('session', () => ({ kind: 'user', id: user.id }));
      addNotification(
        user.id,
        'Welcome to Doctor of Pharmacy (Pharm.D)',
        'Your free account is active. You can now use Jobs, Community, Videos, Shop, and Medicine Requests.',
        '/account/'
      );
      pushToast('Account created! Welcome to DOPA Pakistan.');
      return { ok: true, user };
    },
    [store.users, store.pharmacies, updateKey, addNotification, pushToast]
  );

  const logout = useCallback(() => {
    updateKey('session', () => null);
    pushToast('You have been signed out.', 'info');
  }, [updateKey, pushToast]);

  const updateUserProfile = useCallback(
    (patch: Partial<User>) => {
      if (!currentUser) return;
      updateKey('users', (prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u))
      );
      pushToast('Profile updated.');
    },
    [currentUser, updateKey, pushToast]
  );

  const changePassword = useCallback(
    (currentPw: string, newPw: string) => {
      if (!currentUser) return { ok: false, error: 'Not signed in.' };
      if (currentUser.password !== currentPw) {
        return { ok: false, error: 'Current password is incorrect.' };
      }
      updateKey('users', (prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, password: newPw } : u))
      );
      pushToast('Password changed successfully.');
      return { ok: true };
    },
    [currentUser, updateKey, pushToast]
  );

  // Cart & Shop
  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      const product = store.products.find((p) => p.id === productId);
      if (!product) return;
      const qtyToAdd = Math.max(1, Math.min(product.stock, quantity));
      updateKey('cart', (prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(product.stock, i.quantity + qtyToAdd) }
              : i
          );
        }
        return [...prev, { productId, pharmacyId: product.pharmacyId, quantity: qtyToAdd }];
      });
      pushToast(`Added "${product.name}" to cart.`);
    },
    [store.products, updateKey, pushToast]
  );

  const updateCartQty = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        updateKey('cart', (prev) => prev.filter((i) => i.productId !== productId));
        return;
      }
      const product = store.products.find((p) => p.id === productId);
      const maxStock = product?.stock ?? 99;
      updateKey('cart', (prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(maxStock, quantity) } : i
        )
      );
    },
    [store.products, updateKey]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      updateKey('cart', (prev) => prev.filter((i) => i.productId !== productId));
      pushToast('Item removed from cart.', 'info');
    },
    [updateKey, pushToast]
  );

  const clearPharmacyCart = useCallback(
    (pharmacyId: string) => {
      updateKey('cart', (prev) => prev.filter((i) => i.pharmacyId !== pharmacyId));
    },
    [updateKey]
  );

  const placeOrder = useCallback(
    (payload: {
      pharmacyId: string;
      buyerName: string;
      buyerPhone: string;
      buyerCity: string;
      deliveryAddress: string;
      notes?: string;
      paymentRef: string;
      receiptFileName?: string;
      receiptFileData?: string;
    }) => {
      const pharmacy = store.pharmacies.find((p) => p.id === payload.pharmacyId);
      if (!pharmacy) return null;
      const pharmacyCart = store.cart.filter((c) => c.pharmacyId === payload.pharmacyId);
      if (pharmacyCart.length === 0) return null;

      const items = pharmacyCart
        .map((ci) => {
          const prod = store.products.find((p) => p.id === ci.productId);
          if (!prod) return null;
          return {
            productId: prod.id,
            name: prod.name,
            price: prod.price,
            quantity: ci.quantity,
            image: prod.image,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const order: Order = {
        id: generateId('ord'),
        orderNumber: `DOPA-ORD-${Math.floor(1050 + Math.random() * 8900)}`,
        buyerId: currentUser?.id || 'guest',
        buyerName: payload.buyerName,
        buyerPhone: payload.buyerPhone,
        buyerCity: payload.buyerCity,
        deliveryAddress: payload.deliveryAddress,
        notes: payload.notes,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        items,
        total,
        paymentRef: payload.paymentRef,
        receiptFileName: payload.receiptFileName,
        receiptFileData: payload.receiptFileData,
        status: 'Waiting for payment confirmation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateKey('orders', (prev) => [order, ...prev]);
      clearPharmacyCart(pharmacy.id);
      if (currentUser) {
        addNotification(
          currentUser.id,
          `Order ${order.orderNumber} placed`,
          `Waiting for ${pharmacy.name} to confirm your bank transfer.`,
          '/account/orders/'
        );
      }
      addNotification(
        pharmacy.id,
        `New order ${order.orderNumber}`,
        `${payload.buyerName} placed an order with transfer ref ${payload.paymentRef}.`,
        '/pharmacy-dashboard/orders/'
      );
      pushToast(`Order ${order.orderNumber} submitted!`);
      return order;
    },
    [store.pharmacies, store.cart, store.products, currentUser, updateKey, clearPharmacyCart, addNotification, pushToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const target = store.orders.find((o) => o.id === orderId);
      updateKey('orders', (prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        )
      );
      if (target && target.buyerId !== 'guest') {
        addNotification(
          target.buyerId,
          `Order ${target.orderNumber}: ${status}`,
          `${target.pharmacyName} updated your order status to ${status}.`,
          '/account/orders/'
        );
      }
      pushToast(`Order marked as "${status}".`);
    },
    [store.orders, updateKey, addNotification, pushToast]
  );

  // DOPA Membership
  const applyDopaMembership = useCallback(
    (payload: Omit<DopaMembership, 'id' | 'memberNo' | 'status' | 'submittedAt'>) => {
      const cnicExists = store.memberships.some(
        (m) => m.cnic.trim() === payload.cnic.trim() && m.userId !== payload.userId
      );
      if (cnicExists) {
        return { ok: false, error: 'A DOPA membership already exists for this CNIC number.' };
      }
      const nextNum = store.memberships.length + 12;
      const memberNo = `DOPA-${String(nextNum).padStart(5, '0')}`;
      const existing = store.memberships.find((m) => m.userId === payload.userId);
      const membership: DopaMembership = {
        ...payload,
        id: existing?.id || generateId('mem'),
        memberNo: existing?.memberNo || memberNo,
        status: 'Pending',
        rejectionReason: undefined,
        submittedAt: new Date().toISOString(),
      };
      updateKey('memberships', (prev) => {
        if (existing) {
          return prev.map((m) => (m.id === existing.id ? membership : m));
        }
        return [membership, ...prev];
      });
      addNotification(
        payload.userId,
        'DOPA Membership Application Received',
        'Our admin team is reviewing your qualification proof. You will be notified once approved.',
        '/account/membership/'
      );
      pushToast("Application received — you'll get an email with the decision.");
      return { ok: true, membership };
    },
    [store.memberships, updateKey, addNotification, pushToast]
  );

  const renewDopaMembership = useCallback(
    (membershipId: string) => {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      updateKey('memberships', (prev) =>
        prev.map((m) =>
          m.id === membershipId
            ? {
                ...m,
                status: 'Pending',
                submittedAt: now.toISOString(),
                expiresAt: expiry.toISOString(),
              }
            : m
        )
      );
      pushToast('Renewal request submitted for admin approval.');
    },
    [updateKey, pushToast]
  );

  const adminReviewMembership = useCallback(
    (membershipId: string, decision: 'Approved' | 'Rejected' | 'Revoked' | 'Renew', reason?: string) => {
      const target = store.memberships.find((m) => m.id === membershipId);
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);

      updateKey('memberships', (prev) =>
        prev.map((m) => {
          if (m.id !== membershipId) return m;
          if (decision === 'Approved' || decision === 'Renew') {
            return {
              ...m,
              status: 'Approved',
              rejectionReason: undefined,
              approvedAt: m.approvedAt || now.toISOString(),
              expiresAt: expiry.toISOString(),
            };
          }
          return {
            ...m,
            status: decision,
            rejectionReason: reason || 'Application did not meet verification requirements.',
          };
        })
      );

      if (target) {
        addNotification(
          target.userId,
          `DOPA Membership ${decision}`,
          decision === 'Approved' || decision === 'Renew'
            ? `Your DOPA membership (${target.memberNo}) is active for 12 months.`
            : `Your DOPA membership status was updated to ${decision}. ${reason || ''}`,
          '/account/membership/'
        );
      }
      pushToast(`Membership ${decision.toLowerCase()}.`);
    },
    [store.memberships, updateKey, addNotification, pushToast]
  );

  // Pharmacies
  const registerPharmacy = useCallback(
    (payload: Omit<Pharmacy, 'id' | 'slug' | 'status' | 'submittedAt'>) => {
      const cleanEmail = payload.email.trim().toLowerCase();
      const exists =
        store.pharmacies.some((p) => p.email.toLowerCase() === cleanEmail) ||
        store.users.some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return { ok: false, error: 'An account with this email address already exists.' };
      }
      const baseSlug = slugify(payload.name) || 'pharmacy';
      const slugExists = store.pharmacies.some((p) => p.slug === baseSlug);
      const pharmacy: Pharmacy = {
        ...payload,
        email: cleanEmail,
        id: generateId('ph'),
        slug: slugExists ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
      };
      updateKey('pharmacies', (prev) => [pharmacy, ...prev]);
      pushToast('Submitted — your pharmacy goes live after the admin checks your licence.');
      return { ok: true, pharmacy };
    },
    [store.pharmacies, store.users, updateKey, pushToast]
  );

  const updatePharmacy = useCallback(
    (pharmacyId: string, patch: Partial<Pharmacy>) => {
      updateKey('pharmacies', (prev) =>
        prev.map((p) => (p.id === pharmacyId ? { ...p, ...patch } : p))
      );
      pushToast('Pharmacy details updated.');
    },
    [updateKey, pushToast]
  );

  const adminReviewPharmacy = useCallback(
    (pharmacyId: string, decision: 'Approved' | 'Rejected' | 'Renew') => {
      const now = new Date();
      const exp = new Date(now);
      exp.setFullYear(exp.getFullYear() + 1);
      updateKey('pharmacies', (prev) =>
        prev.map((p) =>
          p.id === pharmacyId
            ? {
                ...p,
                status: decision === 'Renew' ? 'Approved' : decision,
                approvedAt: decision === 'Approved' ? now.toISOString() : p.approvedAt,
                expiresAt: decision === 'Approved' || decision === 'Renew' ? exp.toISOString() : p.expiresAt,
              }
            : p
        )
      );
      pushToast(`Pharmacy ${decision.toLowerCase()}.`);
    },
    [updateKey, pushToast]
  );

  const upsertProduct = useCallback(
    (product: Omit<Product, 'id' | 'slug' | 'createdAt'> & { id?: string }) => {
      updateKey('products', (prev) => {
        if (product.id) {
          return prev.map((p) =>
            p.id === product.id
              ? { ...p, ...product, slug: slugify(product.name) || p.slug }
              : p
          );
        }
        const newProd: Product = {
          ...product,
          id: generateId('prd'),
          slug: `${slugify(product.name)}-${Date.now().toString(36).slice(-4)}`,
          createdAt: new Date().toISOString(),
        };
        return [newProd, ...prev];
      });
      pushToast(product.id ? 'Product updated.' : 'Product added to your pharmacy store.');
    },
    [updateKey, pushToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      updateKey('products', (prev) => prev.filter((p) => p.id !== productId));
      pushToast('Product deleted.', 'info');
    },
    [updateKey, pushToast]
  );

  // Medicine requests
  const createMedicineRequest = useCallback(
    (payload: Omit<MedicineRequest, 'id' | 'status' | 'replies' | 'createdAt'>) => {
      const req: MedicineRequest = {
        ...payload,
        id: generateId('mreq'),
        status: 'Open',
        replies: [],
        createdAt: new Date().toISOString(),
      };
      updateKey('medRequests', (prev) => [req, ...prev]);
      store.pharmacies
        .filter((p) => p.status === 'Approved')
        .forEach((p) => {
          addNotification(
            p.id,
            `New Medicine Request: ${payload.medicineName}`,
            `${payload.strengthForm} (${payload.quantity}) in ${payload.city}.`,
            '/pharmacy-dashboard/requests/'
          );
        });
      pushToast('Request sent to all registered pharmacies!');
      return req;
    },
    [store.pharmacies, updateKey, addNotification, pushToast]
  );

  const replyMedicineRequest = useCallback(
    (requestId: string, reply: Omit<MedicineRequest['replies'][number], 'id' | 'repliedAt'>) => {
      const target = store.medRequests.find((r) => r.id === requestId);
      const newReply = {
        ...reply,
        id: generateId('mrep'),
        repliedAt: new Date().toISOString(),
      };
      updateKey('medRequests', (prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, replies: [...r.replies, newReply] } : r
        )
      );
      if (target) {
        addNotification(
          target.userId,
          `Reply from ${reply.pharmacyName}`,
          `${target.medicineName}: ${reply.available ? `Available (${reply.price ? `PKR ${reply.price.toLocaleString()}` : 'Check note'})` : 'Not available'}`,
          '/account/requests/'
        );
      }
      pushToast('Reply sent to patient.');
    },
    [store.medRequests, updateKey, addNotification, pushToast]
  );

  const closeMedicineRequest = useCallback(
    (requestId: string) => {
      updateKey('medRequests', (prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Closed' } : r))
      );
      pushToast('Medicine request closed.', 'info');
    },
    [updateKey, pushToast]
  );

  // Raw materials
  const applyRmSeller = useCallback(
    (payload: Omit<RmSeller, 'id' | 'status' | 'submittedAt'>) => {
      const existing = store.sellers.find((s) => s.userId === payload.userId);
      const seller: RmSeller = {
        ...payload,
        id: existing?.id || generateId('rms'),
        status: 'Pending',
        submittedAt: new Date().toISOString(),
      };
      updateKey('sellers', (prev) =>
        existing ? prev.map((s) => (s.id === existing.id ? seller : s)) : [seller, ...prev]
      );
      pushToast('Seller application submitted for admin approval.');
      return seller;
    },
    [store.sellers, updateKey, pushToast]
  );

  const adminReviewSeller = useCallback(
    (sellerId: string, decision: 'Approved' | 'Rejected') => {
      const target = store.sellers.find((s) => s.id === sellerId);
      updateKey('sellers', (prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: decision } : s))
      );
      if (target) {
        addNotification(
          target.userId,
          `Raw Materials Seller ${decision}`,
          decision === 'Approved'
            ? 'Your seller account is approved. You can now list materials in the Seller Dashboard.'
            : 'Your raw materials seller application was declined.',
          '/seller-dashboard/'
        );
      }
      pushToast(`Seller ${decision.toLowerCase()}.`);
    },
    [store.sellers, updateKey, addNotification, pushToast]
  );

  const upsertRawMaterial = useCallback(
    (material: Omit<RawMaterial, 'id' | 'slug' | 'createdAt'> & { id?: string }) => {
      updateKey('rawMaterials', (prev) => {
        if (material.id) {
          return prev.map((m) =>
            m.id === material.id
              ? { ...m, ...material, slug: slugify(material.name) || m.slug }
              : m
          );
        }
        const item: RawMaterial = {
          ...material,
          id: generateId('rm'),
          slug: `${slugify(material.name)}-${Date.now().toString(36).slice(-4)}`,
          createdAt: new Date().toISOString(),
        };
        return [item, ...prev];
      });
      pushToast(material.id ? 'Material updated.' : 'Raw material listed.');
    },
    [updateKey, pushToast]
  );

  const deleteRawMaterial = useCallback(
    (materialId: string) => {
      updateKey('rawMaterials', (prev) => prev.filter((m) => m.id !== materialId));
      pushToast('Listing removed.', 'info');
    },
    [updateKey, pushToast]
  );

  const placeRmOrder = useCallback(
    (payload: Omit<RmOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => {
      const order: RmOrder = {
        ...payload,
        id: generateId('rmo'),
        orderNumber: `DOPA-RM-${Math.floor(2000 + Math.random() * 7900)}`,
        status: 'Waiting for payment confirmation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateKey('rmOrders', (prev) => [order, ...prev]);
      addNotification(
        payload.buyerId,
        `Raw material order ${order.orderNumber} placed`,
        `Waiting for ${payload.sellerName} to confirm bank transfer.`,
        '/account/rm-orders/'
      );
      pushToast(`Raw material order ${order.orderNumber} placed!`);
      return order;
    },
    [updateKey, addNotification, pushToast]
  );

  const updateRmOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      updateKey('rmOrders', (prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        )
      );
      pushToast(`RM Order status updated to "${status}".`);
    },
    [updateKey, pushToast]
  );

  // Jobs
  const postJob = useCallback(
    (payload: Omit<Job, 'id' | 'slug' | 'status' | 'postedAt'>) => {
      const job: Job = {
        ...payload,
        id: generateId('job'),
        slug: `${slugify(payload.title)}-${Date.now().toString(36).slice(-4)}`,
        status: 'Pending',
        postedAt: new Date().toISOString(),
      };
      updateKey('jobs', (prev) => [job, ...prev]);
      pushToast('Submitted for review — your job will appear after admin approval.');
      return job;
    },
    [updateKey, pushToast]
  );

  const updateJob = useCallback(
    (jobId: string, patch: Partial<Job>) => {
      updateKey('jobs', (prev) => prev.map((j) => (j.id === jobId ? { ...j, ...patch } : j)));
      pushToast('Job listing updated.');
    },
    [updateKey, pushToast]
  );

  const deleteJob = useCallback(
    (jobId: string) => {
      updateKey('jobs', (prev) => prev.filter((j) => j.id !== jobId));
      pushToast('Job listing deleted.', 'info');
    },
    [updateKey, pushToast]
  );

  // Life Partner
  const saveLpProfile = useCallback(
    (payload: Omit<LifePartnerProfile, 'id' | 'status' | 'paymentStatus' | 'createdAt'> & { id?: string }) => {
      const existing = store.lpProfiles.find((p) => p.userId === payload.userId);
      const profile: LifePartnerProfile = {
        ...payload,
        id: existing?.id || payload.id || generateId('lp'),
        status: existing?.status || 'Pending',
        paymentStatus: existing?.paymentStatus || 'Unpaid',
        paymentRef: existing?.paymentRef,
        receiptFileName: existing?.receiptFileName,
        receiptFileData: existing?.receiptFileData,
        expiresAt: existing?.expiresAt,
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      updateKey('lpProfiles', (prev) =>
        existing ? prev.map((p) => (p.id === existing.id ? profile : p)) : [profile, ...prev]
      );
      pushToast('Life partner profile saved.');
      return profile;
    },
    [store.lpProfiles, updateKey, pushToast]
  );

  const submitLpPayment = useCallback(
    (profileId: string, paymentRef: string, receiptFileName?: string, receiptFileData?: string) => {
      updateKey('lpProfiles', (prev) =>
        prev.map((p) =>
          p.id === profileId
            ? {
                ...p,
                paymentStatus: 'Pending',
                status: 'Pending',
                paymentRef,
                receiptFileName,
                receiptFileData,
              }
            : p
        )
      );
      pushToast('Payment submitted — waiting for admin approval.');
    },
    [updateKey, pushToast]
  );

  const adminReviewLpProfile = useCallback(
    (profileId: string, status: 'Approved' | 'Rejected', paymentStatus?: LifePartnerProfile['paymentStatus']) => {
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      const target = store.lpProfiles.find((p) => p.id === profileId);
      updateKey('lpProfiles', (prev) =>
        prev.map((p) =>
          p.id === profileId
            ? {
                ...p,
                status,
                paymentStatus: paymentStatus || (status === 'Approved' ? 'Approved' : p.paymentStatus),
                expiresAt: status === 'Approved' ? exp.toISOString() : p.expiresAt,
              }
            : p
        )
      );
      if (target) {
        addNotification(
          target.userId,
          `Life Partner Profile ${status}`,
          status === 'Approved'
            ? 'Your profile & payment are approved. You can now browse opposite-gender profiles.'
            : 'Your Life Partner profile update needs attention.',
          '/life-partner/browse/'
        );
      }
      pushToast(`Life Partner profile ${status.toLowerCase()}.`);
    },
    [store.lpProfiles, updateKey, addNotification, pushToast]
  );

  const sendLpRequest = useCallback(
    (toProfileId: string, message?: string) => {
      if (!currentUser || !currentLpProfile) return;
      const target = store.lpProfiles.find((p) => p.id === toProfileId);
      if (!target) return;
      const already = store.lpRequests.some(
        (r) => r.fromUserId === currentUser.id && r.toProfileId === toProfileId
      );
      if (already) {
        pushToast('You have already sent an interest request to this profile.', 'info');
        return;
      }
      const req: LifePartnerRequest = {
        id: generateId('lpr'),
        fromUserId: currentUser.id,
        fromProfileId: currentLpProfile.id,
        toUserId: target.userId,
        toProfileId,
        message,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      updateKey('lpRequests', (prev) => [req, ...prev]);
      addNotification(
        target.userId,
        'New Life Partner Interest Request',
        `${currentLpProfile.name} (${currentLpProfile.city}) sent you an interest request.`,
        '/life-partner/requests/'
      );
      pushToast('Interest request sent! Contact remains hidden until accepted.');
    },
    [currentUser, currentLpProfile, store.lpProfiles, store.lpRequests, updateKey, addNotification, pushToast]
  );

  const respondLpRequest = useCallback(
    (requestId: string, status: 'Accepted' | 'Declined') => {
      const target = store.lpRequests.find((r) => r.id === requestId);
      updateKey('lpRequests', (prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
      if (target) {
        addNotification(
          target.fromUserId,
          `Interest Request ${status}`,
          status === 'Accepted'
            ? 'Your interest request was accepted! Contact details are now visible.'
            : 'Your interest request was declined.',
          '/life-partner/requests/'
        );
      }
      pushToast(`Request ${status.toLowerCase()}.`);
    },
    [store.lpRequests, updateKey, addNotification, pushToast]
  );

  // Community & Videos
  const createPost = useCallback(
    (payload: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'status'>) => {
      const post: CommunityPost = {
        ...payload,
        id: generateId('post'),
        likes: [],
        comments: [],
        status: 'Approved', // Auto-visible in local demo; admin can moderate/pin/delete
        createdAt: new Date().toISOString(),
      };
      updateKey('posts', (prev) => [post, ...prev]);
      pushToast('Post published to the community!');
      return post;
    },
    [updateKey, pushToast]
  );

  const toggleLikePost = useCallback(
    (postId: string) => {
      if (!activeAccountId) return;
      updateKey('posts', (prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const liked = p.likes.includes(activeAccountId);
          return {
            ...p,
            likes: liked ? p.likes.filter((id) => id !== activeAccountId) : [...p.likes, activeAccountId],
          };
        })
      );
    },
    [activeAccountId, updateKey]
  );

  const addComment = useCallback(
    (postId: string, body: string) => {
      if (!activeAccountId) return;
      const authorName = currentUser?.name || currentPharmacy?.name || 'Member';
      const authorRoleLabel = currentPharmacy
        ? `Pharmacy · ${currentPharmacy.city}`
        : isActiveDopaMember
        ? `DOPA Member · ${currentUser?.city || ''}`
        : `${currentUser?.qualification || 'User'} · ${currentUser?.city || ''}`;

      updateKey('posts', (prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: generateId('cmt'),
                    authorId: activeAccountId,
                    authorName,
                    authorRoleLabel,
                    body,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : p
        )
      );
      pushToast('Comment added.');
    },
    [activeAccountId, currentUser, currentPharmacy, isActiveDopaMember, updateKey, pushToast]
  );

  const adminModeratePost = useCallback(
    (postId: string, action: 'approve' | 'pin' | 'delete') => {
      if (action === 'delete') {
        updateKey('posts', (prev) => prev.filter((p) => p.id !== postId));
        pushToast('Post deleted.', 'info');
      } else if (action === 'pin') {
        updateKey('posts', (prev) =>
          prev.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p))
        );
        pushToast('Post pin toggled.');
      } else {
        updateKey('posts', (prev) =>
          prev.map((p) => (p.id === postId ? { ...p, status: 'Approved' } : p))
        );
        pushToast('Post approved.');
      }
    },
    [updateKey, pushToast]
  );

  const shareVideo = useCallback(
    (payload: Omit<VideoItem, 'id' | 'createdAt' | 'status'>) => {
      const vid: VideoItem = {
        ...payload,
        id: generateId('vid'),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      updateKey('videos', (prev) => [vid, ...prev]);
      pushToast('Video submitted — pending admin review.');
      return vid;
    },
    [updateKey, pushToast]
  );

  const adminModerateVideo = useCallback(
    (videoId: string, action: 'approve' | 'delete') => {
      if (action === 'delete') {
        updateKey('videos', (prev) => prev.filter((v) => v.id !== videoId));
        pushToast('Video removed.', 'info');
      } else {
        updateKey('videos', (prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, status: 'Approved' } : v))
        );
        pushToast('Video approved.');
      }
    },
    [updateKey, pushToast]
  );

  // Content, Contact, Notifications, Settings
  const submitContactMessage = useCallback(
    (payload: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>) => {
      const msg: ContactMessage = {
        ...payload,
        id: generateId('msg'),
        read: false,
        createdAt: new Date().toISOString(),
      };
      updateKey('messages', (prev) => [msg, ...prev]);
      pushToast(`Message sent to ${payload.target}. We will respond via email.`);
    },
    [updateKey, pushToast]
  );

  const markMessageRead = useCallback(
    (msgId: string, read: boolean) => {
      updateKey('messages', (prev) => prev.map((m) => (m.id === msgId ? { ...m, read } : m)));
    },
    [updateKey]
  );

  const markNotificationRead = useCallback(
    (notId: string) => {
      updateKey('notifications', (prev) =>
        prev.map((n) => (n.id === notId ? { ...n, read: true } : n))
      );
    },
    [updateKey]
  );

  const markAllNotificationsRead = useCallback(() => {
    if (!activeAccountId) return;
    updateKey('notifications', (prev) =>
      prev.map((n) =>
        n.userId === activeAccountId || n.userId === 'ALL' ? { ...n, read: true } : n
      )
    );
    pushToast('All notifications marked as read.', 'info');
  }, [activeAccountId, updateKey, pushToast]);

  const updateSettings = useCallback(
    (patch: Partial<SiteSettings>) => {
      updateKey('settings', (prev) => ({ ...prev, ...patch }));
      pushToast('Settings saved.');
    },
    [updateKey, pushToast]
  );

  const setSlides = useCallback(
    (slides: NewsSlide[]) => {
      updateKey('slides', () => slides);
      pushToast('Home slider updated.');
    },
    [updateKey, pushToast]
  );

  const upsertArticle = useCallback(
    (article: Omit<Article, 'id'> & { id?: string }) => {
      updateKey('articles', (prev) => {
        if (article.id) {
          return prev.map((a) => (a.id === article.id ? { ...a, ...article } : a));
        }
        return [{ ...article, id: generateId('art') }, ...prev];
      });
      pushToast(article.id ? 'Article updated.' : 'Article published.');
    },
    [updateKey, pushToast]
  );

  const deleteArticle = useCallback(
    (articleId: string) => {
      updateKey('articles', (prev) => prev.filter((a) => a.id !== articleId));
      pushToast('Article deleted.', 'info');
    },
    [updateKey, pushToast]
  );

  const upsertFaq = useCallback(
    (faq: Omit<FaqItem, 'id'> & { id?: string }) => {
      updateKey('faqs', (prev) => {
        if (faq.id) {
          return prev.map((f) => (f.id === faq.id ? { ...f, ...faq } : f));
        }
        return [...prev, { ...faq, id: generateId('faq') }];
      });
      pushToast('FAQ saved.');
    },
    [updateKey, pushToast]
  );

  const deleteFaq = useCallback(
    (faqId: string) => {
      updateKey('faqs', (prev) => prev.filter((f) => f.id !== faqId));
      pushToast('FAQ deleted.', 'info');
    },
    [updateKey, pushToast]
  );

  const upsertUniversity = useCallback(
    (uni: Omit<University, 'id'> & { id?: string }) => {
      updateKey('universities', (prev) => {
        if (uni.id) {
          return prev.map((u) => (u.id === uni.id ? { ...u, ...uni } : u));
        }
        return [...prev, { ...uni, id: generateId('u') }];
      });
      pushToast('University list updated.');
    },
    [updateKey, pushToast]
  );

  const deleteUniversity = useCallback(
    (uniId: string) => {
      updateKey('universities', (prev) => prev.filter((u) => u.id !== uniId));
      pushToast('University removed.', 'info');
    },
    [updateKey, pushToast]
  );

  const adminUpdateUser = useCallback(
    (userId: string, patch: Partial<User>) => {
      updateKey('users', (prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
      pushToast('User updated.');
    },
    [updateKey, pushToast]
  );

  const resetAllDemoData = useCallback(() => {
    const fresh = storageService.resetDemoData();
    setStore(fresh);
    pushToast('Demo data restored to initial state.', 'info');
  }, [pushToast]);

  const value: AppContextValue = {
    ...store,
    theme,
    toggleTheme,
    toasts,
    pushToast,
    dismissToast,
    currentUser,
    currentPharmacy,
    currentMembership,
    isActiveDopaMember,
    currentSeller,
    isApprovedSeller,
    currentLpProfile,
    isApprovedLpMember,
    isAdmin,
    unreadNotificationsCount,
    cartCount,
    login,
    registerUser,
    logout,
    updateUserProfile,
    changePassword,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearPharmacyCart,
    placeOrder,
    updateOrderStatus,
    applyDopaMembership,
    renewDopaMembership,
    adminReviewMembership,
    registerPharmacy,
    updatePharmacy,
    adminReviewPharmacy,
    upsertProduct,
    deleteProduct,
    createMedicineRequest,
    replyMedicineRequest,
    closeMedicineRequest,
    applyRmSeller,
    adminReviewSeller,
    upsertRawMaterial,
    deleteRawMaterial,
    placeRmOrder,
    updateRmOrderStatus,
    postJob,
    updateJob,
    deleteJob,
    saveLpProfile,
    submitLpPayment,
    adminReviewLpProfile,
    sendLpRequest,
    respondLpRequest,
    createPost,
    toggleLikePost,
    addComment,
    adminModeratePost,
    shareVideo,
    adminModerateVideo,
    submitContactMessage,
    markMessageRead,
    markNotificationRead,
    markAllNotificationsRead,
    updateSettings,
    setSlides,
    upsertArticle,
    deleteArticle,
    upsertFaq,
    deleteFaq,
    upsertUniversity,
    deleteUniversity,
    adminUpdateUser,
    resetAllDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
