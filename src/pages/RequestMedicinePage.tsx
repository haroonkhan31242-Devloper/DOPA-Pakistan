import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Pill } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthGate, FileUpload, HoneypotField, PageHeader } from '../components/ui';

export const RequestMedicinePage: React.FC = () => {
  const { currentUser, createMedicineRequest } = useApp();
  const [honeypot, setHoneypot] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [strengthForm, setStrengthForm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [city, setCity] = useState(currentUser?.city || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [rxName, setRxName] = useState('');
  const [rxData, setRxData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentUser) return;
    if (honeypot.trim() !== '') return;
    if (!medicineName.trim()) return setError('Medicine name is required.');
    if (!strengthForm.trim()) return setError('Strength / form (e.g. 500mg tablet) is required.');
    if (!quantity.trim()) return setError('Quantity is required.');
    if (!city.trim()) return setError('City is required.');
    if (!rxName) return setError('A valid prescription photo or PDF is required.');
    if (!phone.trim()) return setError('Phone number is required.');

    const req = createMedicineRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      medicineName: medicineName.trim(),
      strengthForm: strengthForm.trim(),
      quantity: quantity.trim(),
      city: city.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
      prescriptionFileName: rxName,
      prescriptionFileData: rxData,
    });
    setCreatedId(req.id);
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop/' },
          { label: 'Request a medicine' },
        ]}
        eyebrow="Shop"
        title="Request a medicine"
        intro="Can't find a medicine in the shop? Ask all our registered pharmacies at once. They reply with availability and price."
      />

      <section className="pb-14">
        <div className="wrap max-w-2xl">
          {!currentUser ? (
            <AuthGate
              title="Sign in to request a medicine"
              message="Pharmacies reply to your account and may call you, so you need to be signed in."
            />
          ) : createdId ? (
            <div className="dopa-card py-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--okbg)] text-[var(--ok)] grid place-items-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2>Request sent to all registered pharmacies</h2>
              <p className="text-sm text-[var(--muted)]">
                Verified pharmacies across Pakistan can now view your request and reply with availability and price.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/account/requests/" className="dopa-btn primary">
                  View My Medicine Requests
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedId(null);
                    setMedicineName('');
                    setStrengthForm('');
                    setQuantity('');
                    setNotes('');
                    setRxName('');
                    setRxData('');
                  }}
                  className="dopa-btn ghost"
                >
                  Send another request
                </button>
              </div>
            </div>
          ) : (
            <div className="dopa-card">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] text-[var(--accent)] grid place-items-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Prescription Medicine Broadcast</h2>
                  <p className="text-xs text-[var(--muted)]">
                    Sent to all admin-approved pharmacies simultaneously.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mr-name" className="text-sm font-semibold">
                      Medicine name <span className="text-[var(--bad)]">*</span>
                    </label>
                    <input
                      id="mr-name"
                      type="text"
                      className="dopa-input"
                      placeholder="e.g. Eliquis (Apixaban)"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mr-str" className="text-sm font-semibold">
                      Strength / form <span className="text-[var(--bad)]">*</span>
                    </label>
                    <input
                      id="mr-str"
                      type="text"
                      className="dopa-input"
                      placeholder="e.g. 500mg tablet"
                      value={strengthForm}
                      onChange={(e) => setStrengthForm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mr-qty" className="text-sm font-semibold">
                      Quantity <span className="text-[var(--bad)]">*</span>
                    </label>
                    <input
                      id="mr-qty"
                      type="text"
                      className="dopa-input"
                      placeholder="e.g. 2 packs"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mr-city" className="text-sm font-semibold">
                      City <span className="text-[var(--bad)]">*</span>
                    </label>
                    <input
                      id="mr-city"
                      type="text"
                      className="dopa-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mr-phone" className="text-sm font-semibold">
                      Phone <span className="text-[var(--bad)]">*</span>
                    </label>
                    <input
                      id="mr-phone"
                      type="tel"
                      className="dopa-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <FileUpload
                  id="mr-rx"
                  label="Prescription upload"
                  hint="Required — JPG, PNG, WebP or PDF up to 5 MB."
                  fileName={rxName}
                  fileData={rxData}
                  onFileSelect={(n, d) => {
                    setRxName(n);
                    setRxData(d);
                  }}
                  onClear={() => {
                    setRxName('');
                    setRxData('');
                  }}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mr-notes" className="text-sm font-semibold">
                    Notes (optional)
                  </label>
                  <textarea
                    id="mr-notes"
                    className="dopa-textarea"
                    placeholder="Urgency, preferred brand, or delivery instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {error && <div className="dopa-notice bad text-sm">{error}</div>}

                <button type="submit" className="dopa-btn primary">
                  Send to all pharmacies
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
