import { useState } from 'react';
import Sheet from '../ui/Sheet';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { GROCERY_CATEGORIES, UNITS } from '../../config/constants';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useUIStore } from '../../store/useUIStore';

export default function AddItemSheet({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', name_hi: '', quantity: '1', unit: 'piece', category: 'sabzi', is_recurring: false });
  const [loading, setLoading] = useState(false);
  const language = useUIStore((s) => s.language);
  const { start, stop, listening, supported } = useVoiceInput({
    lang: language === 'hi' ? 'hi-IN' : 'en-IN',
    onResult: (transcript) => {
      const cleaned = transcript.replace(/\s+/g, ' ').trim();
      setForm((f) => ({
        ...f,
        [language === 'hi' ? 'name_hi' : 'name']: cleaned,
      }));
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onAdd({ ...form, quantity: parseFloat(form.quantity) || 1 });
      setForm({ name: '', name_hi: '', quantity: '1', unit: 'piece', category: 'sabzi', is_recurring: false });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Add Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Item Name *"
            placeholder="e.g. Tomatoes, Toor Dal, Paneer..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
          {supported && (
            <button
              type="button"
              onClick={listening ? stop : start}
              className={`absolute right-2 top-8 inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
                listening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300'
              }`}
              aria-label={listening ? 'Stop voice input' : 'Voice input'}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>
        <Input
          label="Hindi Name (optional)"
          placeholder="e.g. टमाटर, तूर दाल..."
          value={form.name_hi}
          onChange={(e) => setForm({ ...form, name_hi: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            type="number"
            min="0.1"
            step="0.1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-saffron-400"
            >
              {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {GROCERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm({ ...form, category: cat.id })}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  form.category === cat.id
                    ? 'bg-saffron-500 text-white border-saffron-500'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setForm({ ...form, is_recurring: !form.is_recurring })}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
            form.is_recurring
              ? 'border-kgreen-500 bg-kgreen-50 dark:bg-kgreen-900/20'
              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <RefreshCw size={18} className={form.is_recurring ? 'text-kgreen-600' : 'text-gray-400'} />
          <div className="text-left">
            <div className={`text-sm font-medium ${form.is_recurring ? 'text-kgreen-700 dark:text-kgreen-400' : 'text-gray-600 dark:text-gray-300'}`}>
              Weekly Essential
            </div>
            <div className="text-xs text-gray-400">Auto-appears in recurring list</div>
          </div>
        </button>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Add Item</Button>
        </div>
      </form>
    </Sheet>
  );
}
