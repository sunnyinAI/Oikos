'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import { DIETARY_PREFS } from '@/config/constants';
import { joinList } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
];

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const language = useUIStore((s) => s.language);
  const darkMode = useUIStore((s) => s.darkMode);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const setDarkMode = useUIStore((s) => s.setDarkMode);
  const { addToast } = useUIStore();

  const [form, setForm] = useState(() => ({
    name: user?.name === 'Oikos User' ? '' : user?.name || '',
    family_size: String(user?.family_size || 2),
    monthly_budget: String(user?.monthly_budget || 10000),
    dietary_pref: user?.dietary_pref || 'vegetarian',
  }));
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState(false);

  const currentLanguage = useMemo(
    () => language || user?.language || 'en',
    [language, user?.language],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name || 'Oikos User',
        language: currentLanguage as 'en' | 'hi',
        dark_mode: darkMode ? 1 : 0,
        dietary_pref: form.dietary_pref,
        family_size: parseInt(form.family_size, 10) || 1,
        monthly_budget: parseFloat(form.monthly_budget) || 0,
      });
      addToast('Settings saved', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await joinList(joinCode.trim().toUpperCase());
      addToast('Joined shared grocery list', 'success');
      setJoinCode('');
      router.push('/grocery');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to join', 'error');
    } finally { setJoining(false); }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="page-container space-y-4">
      <Card className="px-5 py-5">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Profile</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Household preferences</h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="Your family name"
            value={form.name}
            onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
            <div className="flex gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <Chip key={opt.value} active={currentLanguage === opt.value} onClick={() => setLanguage(opt.value as 'en' | 'hi')}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <Toggle checked={darkMode} onChange={setDarkMode} label="Enable dark mode" />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Dietary Preference</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_PREFS.map((pref) => (
                <Chip key={pref.value} active={form.dietary_pref === pref.value}
                  onClick={() => setForm((c) => ({ ...c, dietary_pref: pref.value }))}>
                  {pref.icon} {pref.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Family Size" type="number" min="1" value={form.family_size}
              onChange={(e) => setForm((c) => ({ ...c, family_size: e.target.value }))} />
            <Input label="Monthly Budget" type="number" min="0" prefix="₹" value={form.monthly_budget}
              onChange={(e) => setForm((c) => ({ ...c, monthly_budget: e.target.value }))} />
          </div>

          <Button className="w-full" loading={saving} onClick={handleSave}>Save Preferences</Button>
        </div>
      </Card>

      <Card className="px-5 py-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-kgreen-50 p-3 text-kgreen-700 dark:bg-kgreen-900/20 dark:text-kgreen-300">
            <Users size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Join Shared Grocery List</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter an 8-character share code sent by your family.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input className="uppercase" placeholder="AB12CD34" value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)} />
          <Button onClick={handleJoin} loading={joining}>Join</Button>
        </div>

        <Link
          href="/grocery"
          className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-saffron-200 hover:text-saffron-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-saffron-900/40 dark:hover:text-saffron-300"
        >
          <span>Open grocery lists and share through WhatsApp</span>
          <ChevronRight size={16} />
        </Link>
      </Card>

      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={16} />
        Logout
      </Button>
    </div>
  );
}
