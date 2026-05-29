'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';

export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [phone, setPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, sendOtp, isLoading } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const p = sessionStorage.getItem('otp_phone');
    const d = sessionStorage.getItem('otp_dev') || '';
    if (!p) { router.replace('/login'); return; }
    setPhone(p);
    setDevOtp(d);
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setResendTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    try {
      await verifyOtp(phone, otpStr);
      sessionStorage.removeItem('otp_phone');
      sessionStorage.removeItem('otp_dev');
      addToast('Welcome to Omni!', 'success');
      const pendingShareCode = sessionStorage.getItem('pendingShareCode');
      if (pendingShareCode) {
        sessionStorage.removeItem('pendingShareCode');
        router.replace(`/join/${pendingShareCode}`);
        return;
      }
      router.replace('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;
    try {
      const data = await sendOtp(phone);
      addToast('OTP resent!', 'success');
      setResendTimer(30);
      if (data.otp) {
        setDevOtp(data.otp);
        sessionStorage.setItem('otp_dev', data.otp);
        addToast(`Dev OTP: ${data.otp}`, 'info');
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to resend', 'error');
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-cream dark:bg-gray-950 px-6">
      <button
        onClick={() => router.back()}
        className="mt-12 p-2 -ml-2 w-fit rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-8"
      >
        <div className="text-4xl mb-4">📱</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter OTP</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Sent to +91 {phone}
          {devOtp && (
            <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-mono">
              {devOtp}
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-full aspect-square text-center text-2xl font-bold bg-white dark:bg-gray-800 border-2 rounded-2xl transition-all outline-none ${
                  digit
                    ? 'border-saffron-500 text-saffron-600 dark:text-saffron-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
                } focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" loading={isLoading} className="w-full" size="lg">
            Verify & Continue
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Didn&apos;t receive OTP?{' '}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`font-medium ${
              resendTimer > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-saffron-600 dark:text-saffron-400'
            }`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
