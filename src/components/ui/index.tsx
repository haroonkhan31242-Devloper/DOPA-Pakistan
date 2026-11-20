import React, { useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Minus,
  Plus,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { BankDetails, DopaMembership } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDateShort, formatPKR, readFileAsDataUrl, validatePassword } from '../../lib/formatters';

/* -------- PageHeader -------- */
export const PageHeader: React.FC<{
  crumbs?: { label: string; to?: string }[];
  eyebrow?: string;
  title: string;
  intro?: string;
  actions?: React.ReactNode;
}> = ({ crumbs, eyebrow, title, intro, actions }) => (
  <section className="pt-8 pb-6 md:pt-12 md:pb-8">
    <div className="wrap">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-[0.84rem] text-[var(--muted)] mb-2 flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, idx) => (
            <React.Fragment key={c.label}>
              {idx > 0 && <span aria-hidden="true">/</span>}
              {c.to ? (
                <Link to={c.to} className="text-[var(--muted)] hover:text-[var(--accent)] no-underline">
                  {c.label}
                </Link>
              ) : (
                <span className="text-[var(--fg)] font-medium">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1>{title}</h1>
          {intro && <p className="mt-3 text-[1.08rem] text-[var(--muted)] leading-relaxed">{intro}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </div>
    </div>
  </section>
);

/* -------- EmptyState -------- */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="dopa-card flat text-center py-10 px-6 flex flex-col items-center gap-3">
    {icon && (
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] text-[var(--accent)] grid place-items-center">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="text-sm text-[var(--muted)] max-w-md">{description}</p>}
    {action && <div className="mt-1">{action}</div>}
  </div>
);

/* -------- AuthGate -------- */
export const AuthGate: React.FC<{
  title?: string;
  message: string;
  redirectTo?: string;
}> = ({ title = 'Sign in to continue', message, redirectTo }) => {
  const loc = useLocation();
  const target = redirectTo || `${loc.pathname}${loc.search}`;
  const encoded = encodeURIComponent(target);

  return (
    <div className="dopa-card max-w-xl mx-auto text-center py-10 px-6 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#081A2B] to-[#102F4B] text-[#83E5D2] grid place-items-center">
        <Lock className="w-6 h-6" />
      </div>
      <h2>{title}</h2>
      <p className="text-[var(--muted)] max-w-md">{message}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-1">
        <Link className="dopa-btn primary" to={`/login/?redirect=${encoded}`}>
          Sign in
        </Link>
        <Link className="dopa-btn ghost" to={`/register/?redirect=${encoded}`}>
          Sign up
        </Link>
      </div>
    </div>
  );
};

/* -------- StatusBadge (Explicit label + semantic colors, never hue-only) -------- */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  let cls = 'bg-[var(--surface2)] text-[var(--fg)]';
  if (s.includes('approv') || s.includes('live') || s.includes('confirm') || s.includes('deliver') || s.includes('accept') || s.includes('verified')) {
    cls = 'bg-[var(--okbg)] text-[var(--ok)]';
  } else if (s.includes('pend') || s.includes('wait') || s.includes('dispatch') || s.includes('expir')) {
    cls = 'bg-[var(--warnbg)] text-[var(--warn)]';
  } else if (s.includes('reject') || s.includes('revok') || s.includes('cancel') || s.includes('declin') || s.includes('unpaid')) {
    cls = 'bg-[var(--badbg)] text-[var(--bad)]';
  } else if (s.includes('open')) {
    cls = 'bg-[var(--infobg)] text-[var(--info)]';
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
};

/* -------- HoneypotField -------- */
export const HoneypotField: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const id = useId();
  return (
    <div className="sr" aria-hidden="true">
      <label htmlFor={id}>Leave this empty</label>
      <input
        id={id}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

/* -------- PasswordInput -------- */
export const PasswordInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  showStrengthHint?: boolean;
  required?: boolean;
  error?: string;
}> = ({ id, label, value, onChange, placeholder, showStrengthHint = true, required, error }) => {
  const [visible, setVisible] = useState(false);
  const strengthErr = value ? validatePassword(value) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label} {required && <span className="text-[var(--bad)]">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="dopa-input pr-11"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrengthHint && (
        <span className={`text-xs ${value && !strengthErr ? 'text-[var(--ok)]' : 'text-[var(--muted)]'}`}>
          {value && !strengthErr
            ? 'Password meets strength requirements (10+ characters, letters + number).'
            : 'At least 10 characters, with letters and a number.'}
        </span>
      )}
      {error && <span className="text-xs text-[var(--bad)]">{error}</span>}
    </div>
  );
};

/* -------- FileUpload (JPG/PNG/WebP/PDF, max 5MB, preview & remove) -------- */
export const FileUpload: React.FC<{
  id: string;
  label: string;
  accept?: string;
  hint?: string;
  required?: boolean;
  fileName?: string;
  fileData?: string;
  onFileSelect: (fileName: string, fileData: string) => void;
  onClear: () => void;
}> = ({
  id,
  label,
  accept = '.jpg,.jpeg,.png,.webp,.pdf',
  hint = 'JPG, PNG, WebP or PDF up to 5 MB.',
  required,
  fileName,
  fileData,
  onFileSelect,
  onClear,
}) => {
  const [err, setErr] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErr('File exceeds the 5 MB limit.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onFileSelect(file.name, dataUrl);
    } catch {
      setErr('Could not read file.');
    }
  };

  const isImage = fileData?.startsWith('data:image/') || /\.(jpg|jpeg|png|webp)$/i.test(fileName || '');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label} {required && <span className="text-[var(--bad)]">*</span>}
      </label>
      {!fileName ? (
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--line)] hover:border-[var(--accent)] rounded-xl p-5 bg-[var(--surface)] cursor-pointer transition-colors text-center"
        >
          <Upload className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-sm font-medium">Choose file to upload</span>
          <span className="text-xs text-[var(--muted)]">{hint}</span>
          <input id={id} type="file" accept={accept} onChange={handleChange} className="sr" />
        </label>
      ) : (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
          <div className="flex items-center gap-3 min-w-0">
            {isImage && fileData ? (
              <img src={fileData} alt={fileName} className="w-12 h-12 rounded-lg object-cover border border-[var(--line)] shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[var(--surface)] grid place-items-center text-[var(--accent)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{fileName}</div>
              <div className="text-xs text-[var(--ok)]">Ready for upload</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="dopa-btn sm ghost text-[var(--bad)]"
            aria-label={`Remove ${fileName}`}
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      )}
      {fileName && hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      {err && <span className="text-xs text-[var(--bad)]">{err}</span>}
    </div>
  );
};

/* -------- QuantityStepper -------- */
export const QuantityStepper: React.FC<{
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  ariaLabel?: string;
}> = ({ value, min = 1, max = 99, onChange, ariaLabel = 'Quantity' }) => (
  <div className="inline-flex items-center border border-[var(--line)] rounded-full bg-[var(--surface)] overflow-hidden">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`Decrease ${ariaLabel}`}
      className="px-2.5 py-1.5 text-[var(--fg)] hover:bg-[var(--surface2)] disabled:opacity-40 cursor-pointer"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
    <span className="px-2.5 text-sm font-semibold num min-w-[2rem] text-center">{value}</span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`Increase ${ariaLabel}`}
      className="px-2.5 py-1.5 text-[var(--fg)] hover:bg-[var(--surface2)] disabled:opacity-40 cursor-pointer"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  </div>
);

/* -------- BankDetailsBox + PaymentConfirm -------- */
export const BankDetailsBox: React.FC<{
  bank: BankDetails;
  amount: number;
  remarkInstruction?: string;
  confirmed: boolean;
  onToggleConfirm: () => void;
  paymentRef: string;
  onPaymentRefChange: (val: string) => void;
  receiptFileName?: string;
  receiptFileData?: string;
  onReceiptSelect: (name: string, data: string) => void;
  onReceiptClear: () => void;
  receiptRequired?: boolean;
}> = ({
  bank,
  amount,
  remarkInstruction,
  confirmed,
  onToggleConfirm,
  paymentRef,
  onPaymentRefChange,
  receiptFileName,
  receiptFileData,
  onReceiptSelect,
  onReceiptClear,
  receiptRequired = false,
}) => {
  const { pushToast } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyText = (label: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedField(label);
    pushToast(`${label} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="dopa-card flat bg-[var(--surface2)] flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="eyebrow">Bank Transfer Details</div>
          <h3 className="mt-1">Transfer exact amount: {formatPKR(amount)}</h3>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)]">
        <div>
          <div className="text-xs text-[var(--muted)]">Account title</div>
          <div className="font-semibold">{bank.accountTitle}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--muted)]">Bank &amp; branch</div>
          <div className="font-semibold">
            {bank.bankName}
            {bank.branchCity ? ` · ${bank.branchCity}` : ''}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-[var(--muted)]">IBAN</div>
            <div className="font-mono-dopa text-xs sm:text-sm font-medium truncate">{bank.iban}</div>
          </div>
          <button
            type="button"
            onClick={() => copyText('IBAN', bank.iban)}
            className="dopa-btn sm ghost"
          >
            {copiedField === 'IBAN' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-[var(--muted)]">Account number</div>
            <div className="font-mono-dopa text-xs sm:text-sm font-medium truncate">{bank.accountNumber}</div>
          </div>
          <button
            type="button"
            onClick={() => copyText('Account number', bank.accountNumber)}
            className="dopa-btn sm ghost"
          >
            {copiedField === 'Account number' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy
          </button>
        </div>
      </div>

      {remarkInstruction && (
        <div className="dopa-notice">
          <div className="text-sm">
            <b>Payment reference / remark:</b> {remarkInstruction}
          </div>
        </div>
      )}

      {!confirmed ? (
        <div>
          <button type="button" onClick={onToggleConfirm} className="dopa-btn primary">
            Confirm payment
          </button>
          <p className="text-xs text-[var(--muted)] mt-2">
            Transfer the exact amount shown above, then press &ldquo;Confirm payment&rdquo; to enter your bank reference.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-2 border-t border-[var(--line)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="txRef" className="text-sm font-semibold">
              Transfer reference / Transaction ID <span className="text-[var(--bad)]">*</span>
            </label>
            <input
              id="txRef"
              type="text"
              className="dopa-input"
              placeholder="e.g. MZN-94812034"
              value={paymentRef}
              onChange={(e) => onPaymentRefChange(e.target.value)}
              required
            />
          </div>
          <FileUpload
            id="txReceipt"
            label={`Payment receipt${receiptRequired ? '' : ' (optional)'}`}
            fileName={receiptFileName}
            fileData={receiptFileData}
            onFileSelect={onReceiptSelect}
            onClear={onReceiptClear}
            required={receiptRequired}
          />
        </div>
      )}
    </div>
  );
};

/* -------- MemberCard (with QRCodeSVG linking to /verify-member/?no=...) -------- */
export const MemberCard: React.FC<{
  membership: Pick<
    DopaMembership,
    'fullName' | 'qualification' | 'city' | 'memberNo' | 'expiresAt' | 'status'
  >;
  showActions?: boolean;
}> = ({ membership, showActions = false }) => {
  const { pushToast } = useApp();
  const verifyUrl = `${window.location.origin}/verify-member/?no=${encodeURIComponent(membership.memberNo)}`;
  const isInactive = membership.status !== 'Approved';

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `DOPA Member Card — ${membership.memberNo}`,
        text: `Verify DOPA Membership ${membership.memberNo}`,
        url: verifyUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(verifyUrl).catch(() => {});
      pushToast('Verification link copied to clipboard.', 'info');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className={`mcard ${isInactive ? 'inactive' : ''}`}>
        <img
          src="/assets/img/dopa-assoc-logo.png"
          alt=""
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[56%] max-w-[260px] opacity-10 pointer-events-none select-none"
        />
        <div className="flex justify-between items-start gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/assets/img/dopa-assoc-logo.png"
              alt="DOPA Logo"
              className="w-11 h-11 rounded-full bg-white object-contain p-0.5 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-display font-extrabold text-xl tracking-wider leading-none text-white">
                DOPA
              </span>
              <span className="block text-[0.78rem] text-[#E8F3F6] leading-tight mt-0.5">
                Doctor of Pharmacy Association Pakistan
              </span>
            </div>
          </div>
          <span className="font-mono-dopa text-[0.65rem] tracking-widest uppercase border border-[#83E5D2]/50 text-[#83E5D2] rounded-full px-2.5 py-1 whitespace-nowrap shrink-0">
            {membership.status === 'Approved' ? 'VERIFIED MEMBER' : membership.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4 my-1">
          <div className="w-[74px] h-[94px] rounded-xl border-2 border-white/80 bg-[#83E5D2]/15 grid place-items-center font-display font-bold text-2xl text-[#83E5D2] shrink-0">
            {membership.fullName
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xl text-white leading-tight truncate">
              {membership.fullName}
            </div>
            <div className="font-mono-dopa text-sm tracking-wider text-[#83E5D2] mt-1">
              {membership.memberNo}
            </div>
            <div className="text-xs text-[#C8DDE6] mt-1">{membership.qualification}</div>
          </div>
        </div>

        <div className="flex justify-between items-end gap-3">
          <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs">
            <div>
              <span className="block font-mono-dopa text-[0.58rem] tracking-widest uppercase text-white/65">
                City
              </span>
              <span className="font-semibold text-white">{membership.city}</span>
            </div>
            <div>
              <span className="block font-mono-dopa text-[0.58rem] tracking-widest uppercase text-white/65">
                Valid until
              </span>
              <span className="font-semibold text-white num">
                {membership.expiresAt ? formatDateShort(membership.expiresAt) : 'Pending'}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-1.5 w-16 h-16 shrink-0" title="Scan to verify member">
            <QRCodeSVG value={verifyUrl} size={52} />
          </div>
        </div>

        <div className="font-mono-dopa text-[0.65rem] tracking-widest uppercase text-[#83E5D2]/85">
          Scan QR to verify at /verify-member/
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-2.5 no-print">
          <button type="button" onClick={handleDownload} className="dopa-btn sm primary">
            <Download className="w-4 h-4" /> Download / Print PDF
          </button>
          <button type="button" onClick={handleShare} className="dopa-btn sm ghost">
            <Share2 className="w-4 h-4" /> Share Verification Link
          </button>
          <Link to={`/verify-member/?no=${encodeURIComponent(membership.memberNo)}`} className="dopa-btn sm ghost">
            Test QR Verification
          </Link>
        </div>
      )}
    </div>
  );
};

/* -------- Modal & ConfirmDialog -------- */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="dopa-card max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full border border-[var(--line)] grid place-items-center hover:border-[var(--accent)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <p className="text-[var(--muted)] mb-5">{message}</p>
    <div className="flex justify-end gap-2.5">
      <button type="button" onClick={onCancel} className="dopa-btn sm ghost">
        Cancel
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirm();
          onCancel();
        }}
        className={`dopa-btn sm ${danger ? 'danger' : 'primary'}`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

/* -------- ToastContainer -------- */
export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2 max-w-sm w-[calc(100vw-32px)] pointer-events-none">
      {toasts.map((t) => {
        const colors =
          t.type === 'bad'
            ? 'bg-[var(--badbg)] text-[var(--bad)] border-[var(--bad)]/30'
            : t.type === 'warn'
            ? 'bg-[var(--warnbg)] text-[var(--warn)] border-[var(--warn)]/30'
            : t.type === 'info'
            ? 'bg-[var(--infobg)] text-[var(--info)] border-[var(--info)]/30'
            : 'bg-[var(--okbg)] text-[var(--ok)] border-[var(--ok)]/30';

        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg text-sm font-medium ${colors}`}
          >
            {t.type === 'bad' || t.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{t.text}</span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
