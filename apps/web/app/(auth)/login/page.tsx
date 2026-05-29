'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { sendOtp, isLoading } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const pendingShareCode =
    typeof window !== 'undefined' ? sessionStorage.getItem('pendingShareCode') : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    try {
      const data = await sendOtp(phone);
      addToast('OTP sent successfully!', 'success');
      // Store phone for OTP page
      sessionStorage.setItem('otp_phone', phone);
      if (data.otp) sessionStorage.setItem('otp_dev', data.otp);
      router.push('/otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-cream dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-saffron-500 to-saffron-800 px-6 pt-16 pb-12 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0E7490 0%, #073D4A 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
        >
          {/* inner chalkboard surface */}
          <div className="absolute inset-[5px] rounded-2xl" style={{ background: 'linear-gradient(135deg, #0C3547 0%, #071E2B 100%)' }} />
          {/* chalk dust specks */}
          <span className="absolute bottom-2 left-2.5 w-1 h-0.5 rounded-full bg-white/30" />
          <span className="absolute bottom-2 left-5 w-0.5 h-0.5 rounded-full bg-white/25" />
          <span className="relative text-4xl font-bold font-devanagari" style={{ color: 'rgba(230,248,255,0.92)', textShadow: '0 0 6px rgba(255,255,255,0.15)' }}>ॐ</span>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold mb-1">Omni</h1>
          <p className="text-white/80 text-lg">सब कुछ, एक जगह</p>
          <p className="text-white/60 text-sm mt-1">Sab kuch, ek jagah</p>
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
          Welcome! Enter your number
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          We'll send a one-time password to verify your number
        </p>

        {pendingShareCode && (
          <div className="mb-6 rounded-2xl border border-saffron-200 bg-saffron-50 px-4 py-3 text-sm text-saffron-900 dark:border-saffron-900/50 dark:bg-saffron-950/40 dark:text-saffron-200">
            Sign in to join family list code{' '}
            <span className="font-semibold">{pendingShareCode}</span>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile Number
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
            Send OTP
            <ChevronRight size={18} />
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
