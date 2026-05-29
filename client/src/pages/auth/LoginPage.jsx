import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import Button from '../../components/ui/Button';

const T = {
  welcome: { en: 'Welcome! Enter your number', hi: 'स्वागत है! अपना नंबर डालें' },
  weWillSend: { en: "We'll send a one-time password to verify your number", hi: 'पुष्टि के लिए हम एक OTP भेजेंगे' },
  mobile: { en: 'Mobile Number', hi: 'मोबाइल नंबर' },
  invalid: { en: 'Enter a valid 10-digit Indian mobile number', hi: 'सही 10-अंकों का मोबाइल नंबर डालें' },
  sendOtp: { en: 'Send OTP', hi: 'OTP भेजें' },
  signInJoin: {
    en: 'Sign in to join family list code',
    hi: 'पारिवारिक लिस्ट से जुड़ने के लिए साइन-इन करें — कोड',
  },
  tagline: { en: 'The Intelligence Behind Household Wealth', hi: 'The Intelligence Behind Household Wealth' },
  terms: {
    en: 'By continuing, you agree to our Terms of Service and Privacy Policy',
    hi: 'जारी रखकर आप हमारी सेवा शर्तें और गोपनीयता नीति से सहमत हैं',
  },
};

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { sendOtp, isLoading } = useAuthStore();
  const { addToast, language, setLanguage } = useUIStore();
  const t = (k) => T[k]?.[language] || T[k]?.en;
  const location = useLocation();
  const navigate = useNavigate();
  const pendingShareCode =
    location.state?.shareCode || sessionStorage.getItem('pendingShareCode');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t('invalid'));
      return;
    }
    try {
      const data = await sendOtp(phone);
      addToast('OTP sent successfully!', 'success');
      navigate('/otp', { state: { phone, devOtp: data.otp } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-cream dark:bg-gray-950 max-w-[480px] mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-gradient px-6 pt-12 pb-12 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="relative mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/30"
          >
            {language === 'hi' ? 'EN' : 'हिंदी'}
          </button>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative w-20 h-20 bg-white/20 ring-1 ring-white/30 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-glow"
        >
          <span className="text-4xl font-extrabold text-white">Ω</span>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <h1 className="text-3xl font-bold mb-1">Oikos</h1>
          <p className="text-white/85 text-base mt-1">{t('tagline')}</p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 pt-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('welcome')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          {t('weWillSend')}
        </p>

        {pendingShareCode && (
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-200">
            {t('signInJoin')} <span className="font-semibold">{pendingShareCode}</span>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('mobile')}
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 text-lg tracking-wider"
                autoFocus
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <Button type="submit" loading={isLoading} className="w-full" size="lg">
            {t('sendOtp')}
            <ChevronRight size={18} />
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          {t('terms')}
        </p>
      </motion.div>
    </div>
  );
}
