import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Trash2, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Input from '../components/ui/Input';
import Toggle from '../components/ui/Toggle';
import { DIETARY_PREFS } from '../config/constants';
import { joinList } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import NotificationsCard from '../components/settings/NotificationsCard';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const language = useUIStore((state) => state.language);
  const darkMode = useUIStore((state) => state.darkMode);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const setDarkMode = useUIStore((state) => state.setDarkMode);
  const { addToast } = useUIStore();

  const [form, setForm] = useState(() => ({
    name: user?.name === 'Omni User' ? '' : user?.name || '',
    family_size: String(user?.family_size || 2),
    monthly_budget: String(user?.monthly_budget || 10000),
    dietary_pref: user?.dietary_pref || 'vegetarian',
  }));
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const currentLanguage = useMemo(() => language || user?.language || 'en', [language, user?.language]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name || 'Omni User',
        language: currentLanguage,
        dark_mode: darkMode ? 1 : 0,
        dietary_pref: form.dietary_pref,
        family_size: parseInt(form.family_size, 10) || 1,
        monthly_budget: parseFloat(form.monthly_budget) || 0,
      });
      addToast('Settings saved', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await joinList(joinCode.trim().toUpperCase());
      addToast('Joined shared grocery list', 'success');
      setJoinCode('');
      navigate('/grocery');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setJoining(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      addToast('Type DELETE to confirm account deletion', 'error');
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount();
      addToast('Account deleted', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      addToast(err.message, 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="page-container space-y-4">
      <Card className="px-5 py-5">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Profile</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Household preferences
          </h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="Your family name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Language
            </label>
            <div className="flex gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  active={currentLanguage === option.value}
                  onClick={() => setLanguage(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <Toggle
            checked={darkMode}
            onChange={setDarkMode}
            label="Enable dark mode"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dietary Preference
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_PREFS.map((pref) => (
                <Chip
                  key={pref.value}
                  active={form.dietary_pref === pref.value}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      dietary_pref: pref.value,
                    }))
                  }
                >
                  {pref.icon} {pref.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Family Size"
              type="number"
              min="1"
              value={form.family_size}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  family_size: event.target.value,
                }))
              }
            />
            <Input
              label="Monthly Budget"
              type="number"
              min="0"
              prefix="₹"
              value={form.monthly_budget}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  monthly_budget: event.target.value,
                }))
              }
            />
          </div>

          <Button className="w-full" loading={saving} onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </Card>

      <NotificationsCard />

      <Card className="px-5 py-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-kgreen-50 p-3 text-kgreen-700 dark:bg-kgreen-900/20 dark:text-kgreen-300">
            <Users size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Join Shared Grocery List
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter an 8-character share code sent by your family.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            className="uppercase"
            placeholder="AB12CD34"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
          />
          <Button onClick={handleJoin} loading={joining}>
            Join
          </Button>
        </div>

        <Link
          to="/grocery"
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

      <Card className="border border-red-100 px-5 py-5 dark:border-red-900/40">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-300">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Delete account
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permanently removes your profile, sessions, lists, pantry, finance data, meal plans, and chat history.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
          />
          <Button
            variant="danger"
            className="w-full"
            loading={deleting}
            disabled={deleteConfirm !== 'DELETE'}
            onClick={handleDeleteAccount}
          >
            <Trash2 size={16} />
            Delete My Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
