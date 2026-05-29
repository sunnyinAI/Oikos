import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Loader2, Trash2, Sparkles, X, Check } from 'lucide-react';
import Sheet from '../ui/Sheet';
import Button from '../ui/Button';
import { scanBill, addPantryItem, addTransaction } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { usePantryStore } from '../../store/usePantryStore';

const MAX_BYTES = 4 * 1024 * 1024;

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressImage = async (file, maxDim = 1600, quality = 0.85) => {
  if (typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    if (!blob) return file;
    return new File([blob], 'bill.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
};

export default function BillScannerSheet({ isOpen, onClose }) {
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('pick'); // pick | scanning | review
  const addToast = useUIStore((s) => s.addToast);
  const refetchFinance = useFinanceStore((s) => s.fetchAll);
  const fetchPantry = usePantryStore((s) => s.fetchItems);

  const reset = () => {
    setPreviewUrl(null);
    setResult(null);
    setStep('pick');
    setScanning(false);
    setSaving(false);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const pickFile = (capture) => {
    if (!fileRef.current) return;
    if (capture) fileRef.current.setAttribute('capture', 'environment');
    else fileRef.current.removeAttribute('capture');
    fileRef.current.click();
  };

  const onFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please choose an image', 'error');
      return;
    }
    const compact = file.size > MAX_BYTES ? await compressImage(file) : file;
    const dataUrl = await fileToBase64(compact);
    setPreviewUrl(dataUrl);
    setStep('scanning');
    setScanning(true);
    try {
      const parsed = await scanBill(dataUrl, compact.type);
      if (parsed.notes === 'not_a_bill' || (parsed.items.length === 0 && !parsed.total)) {
        addToast("Hmm, that didn't look like a bill. Try a clearer photo.", 'error');
        reset();
        return;
      }
      setResult({
        ...parsed,
        items: parsed.items.map((i) => ({ ...i, _keep: true })),
        date: parsed.date || new Date().toISOString().slice(0, 10),
      });
      setStep('review');
    } catch (err) {
      addToast(err.message || 'Could not scan this bill', 'error');
      reset();
    } finally {
      setScanning(false);
    }
  };

  const toggleItem = (idx) => {
    setResult((r) => ({
      ...r,
      items: r.items.map((it, i) => (i === idx ? { ...it, _keep: !it._keep } : it)),
    }));
  };

  const updateItemName = (idx, name) => {
    setResult((r) => ({
      ...r,
      items: r.items.map((it, i) => (i === idx ? { ...it, name } : it)),
    }));
  };

  const removeItem = (idx) => {
    setResult((r) => ({ ...r, items: r.items.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const keepers = result.items.filter((i) => i._keep);

      // 1. Push transaction (grand total)
      if (Number(result.total) > 0) {
        await addTransaction({
          amount: Number(result.total),
          type: 'expense',
          category: 'grocery',
          description: `${result.vendor || 'Bill'} — ${keepers.length} item${keepers.length !== 1 ? 's' : ''}`,
          date: result.date,
          payment_method: 'upi',
        });
      }

      // 2. Push items to pantry
      const today = new Date().toISOString().slice(0, 10);
      await Promise.all(
        keepers.map((i) =>
          addPantryItem({
            name: i.name,
            quantity: i.quantity || 1,
            unit: i.unit || 'piece',
            category: i.category || 'other',
            storage_zone: i.category === 'dairy' || i.category === 'frozen' ? 'fridge' : 'shelf',
            purchase_date: result.date || today,
            purchase_price: i.price || null,
          }).catch(() => null)
        )
      );

      addToast(`Saved ${keepers.length} item${keepers.length !== 1 ? 's' : ''} + ₹${result.total || 0}`, 'success');
      await Promise.all([refetchFinance(), fetchPantry()]);
      close();
    } catch (err) {
      addToast(err.message || 'Could not save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={close} title="Scan Bill">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFileChosen}
        className="hidden"
      />

      {step === 'pick' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Snap a kirana, Blinkit, Zepto or any receipt — we'll auto-add the items to your pantry and the total to your expenses.
          </p>
          <button
            onClick={() => pickFile(true)}
            className="w-full rounded-2xl bg-brand-gradient p-5 text-left text-white shadow-glow active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <Camera size={24} />
              <div>
                <p className="text-base font-semibold">Take photo</p>
                <p className="text-xs text-white/80">Use your camera</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => pickFile(false)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left active:scale-[0.98] transition-transform dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <Upload size={22} className="text-brand-600" />
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Upload from gallery</p>
                <p className="text-xs text-gray-500">JPG / PNG, up to 4 MB</p>
              </div>
            </div>
          </button>
          <p className="rounded-xl bg-accent-50 px-3 py-2 text-xs text-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
            <Sparkles size={12} className="mr-1 inline" />
            Powered by Gemini. Items are extracted automatically — you can edit before saving.
          </p>
        </div>
      )}

      {step === 'scanning' && (
        <div className="py-10 text-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Bill"
              className="mx-auto mb-4 max-h-48 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
            />
          )}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-3 inline-block text-brand-500"
          >
            <Loader2 size={32} />
          </motion.div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Reading your bill…</p>
          <p className="mt-1 text-xs text-gray-500">Extracting items, prices, total</p>
        </div>
      )}

      {step === 'review' && result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-900/40 dark:bg-brand-900/20">
            <p className="text-[11px] uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Bill summary
            </p>
            <p className="mt-1 truncate text-base font-semibold text-gray-900 dark:text-gray-100">
              {result.vendor || 'Unknown vendor'}
            </p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{result.date}</span>
              <span className="text-lg font-bold text-money-600">₹{result.total || 0}</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Items ({result.items.filter((i) => i._keep).length}/{result.items.length})
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {result.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                    item._keep
                      ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                      : 'border-gray-100 bg-gray-50 opacity-50 dark:border-gray-800 dark:bg-gray-900'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(idx)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      item._keep
                        ? 'border-money-500 bg-money-500 text-white'
                        : 'border-gray-300'
                    }`}
                    aria-label="Toggle item"
                  >
                    {item._keep && <Check size={12} />}
                  </button>
                  <input
                    value={item.name}
                    onChange={(e) => updateItemName(idx, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-500">
                    {item.quantity}{item.unit !== 'piece' ? ' ' + item.unit : ''}
                  </span>
                  {item.price != null && (
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      ₹{item.price}
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={reset} className="flex-1">
              <X size={16} /> Redo
            </Button>
            <Button type="button" onClick={save} loading={saving} className="flex-1">
              <Check size={16} /> Save bill
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
