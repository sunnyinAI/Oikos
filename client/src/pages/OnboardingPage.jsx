import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Users, PiggyBank, CookingPot, Check } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import Button from '../components/ui/Button';

const SLIDES = [
  {
    icon: Users,
    bg: 'from-brand-500 via-brand-500 to-brand-700',
    title: { en: 'Share with the whole family', hi: 'पूरे परिवार के साथ साझा करें' },
    body: {
      en: 'One grocery list for everyone. Maa adds dudh, Papa adds atta — no more "kuch laana tha?" calls.',
      hi: 'एक ही ग्रॉसरी लिस्ट सबके लिए। माँ दूध जोड़े, पापा आटा — फिर "कुछ लाना था?" वाला फ़ोन नहीं।',
    },
  },
  {
    icon: PiggyBank,
    bg: 'from-money-500 via-money-500 to-money-700',
    title: { en: 'Save real paisa, every month', hi: 'हर महीने असली पैसा बचाओ' },
    body: {
      en: 'See where your kharcha goes. Compare Blinkit vs Zepto vs mandi. Bills, budgets, all in one place.',
      hi: 'खर्चा कहाँ जा रहा है देखो। ब्लिंकिट, ज़ेप्टो, मंडी की तुलना करो। बिल, बजट — सब एक जगह।',
    },
  },
  {
    icon: CookingPot,
    bg: 'from-accent-500 via-accent-500 to-accent-700',
    title: { en: 'Plan meals from your pantry', hi: 'पैंट्री से खाना प्लान करो' },
    body: {
      en: 'Use what you already have before it expires. Recipes powered by your shelf, not random suggestions.',
      hi: 'जो है उसी से बनाओ, खराब होने से पहले। आपकी पैंट्री के हिसाब से रेसिपी।',
    },
  },
];

const ROLES = [
  { key: 'maa', emoji: '👩', label: { en: 'Maa', hi: 'माँ' } },
  { key: 'papa', emoji: '👨', label: { en: 'Papa', hi: 'पापा' } },
  { key: 'beta', emoji: '🧑‍🎓', label: { en: 'Son / Daughter', hi: 'बेटा / बेटी' } },
  { key: 'dadi', emoji: '👵', label: { en: 'Dadi / Nani', hi: 'दादी / नानी' } },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { language, setLanguage, role, setRole, completeOnboarding } = useUIStore();
  const navigate = useNavigate();
  const isFinalStep = step === SLIDES.length;

  const finish = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  const next = () => (isFinalStep ? finish() : setStep((s) => s + 1));

  if (isFinalStep) {
    return (
      <div className="relative min-h-screen min-h-dvh bg-cream dark:bg-gray-950 max-w-[480px] mx-auto flex flex-col">
        <div className="relative overflow-hidden bg-brand-gradient px-6 pt-14 pb-10 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
          <h2 className="text-2xl font-bold tracking-tight">
            {language === 'hi' ? 'अंतिम कदम' : 'One last thing'}
          </h2>
          <p className="mt-2 text-white/85">
            {language === 'hi' ? 'आप घर में कौन हैं?' : 'Who are you in the house?'}
          </p>
        </div>
        <div className="flex-1 px-6 py-8">
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`relative rounded-2xl border-2 p-5 text-left transition-all active:scale-95 ${
                  role === r.key
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <span className="text-4xl">{r.emoji}</span>
                <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
                  {r.label[language] || r.label.en}
                </p>
                {role === r.key && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Check size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={finish}
            disabled={!role}
            size="lg"
            className="mt-8 w-full"
          >
            {language === 'hi' ? 'शुरू करें' : "Let's go"}
            <ChevronRight size={18} />
          </Button>
          <button
            onClick={finish}
            className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {language === 'hi' ? 'अभी छोड़ें' : 'Skip for now'}
          </button>
        </div>
      </div>
    );
  }

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="relative min-h-screen min-h-dvh bg-cream dark:bg-gray-950 max-w-[480px] mx-auto flex flex-col">
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-brand-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 dark:bg-gray-800 dark:text-brand-300 dark:ring-brand-900/50"
          >
            {language === 'hi' ? 'EN' : 'हिं'}
          </button>
          <button
            onClick={finish}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {language === 'hi' ? 'छोड़ें' : 'Skip'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1 px-6 pt-8 flex flex-col"
        >
          <div
            className={`relative aspect-square w-full max-w-xs mx-auto rounded-3xl bg-gradient-to-br ${slide.bg} flex items-center justify-center shadow-glow overflow-hidden`}
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <Icon className="relative text-white" size={96} strokeWidth={1.5} />
          </div>

          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {slide.title[language] || slide.title.en}
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {slide.body[language] || slide.body.en}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="px-6 pb-10 pt-4 safe-bottom">
        <Button type="button" onClick={next} size="lg" className="w-full">
          {step === SLIDES.length - 1
            ? language === 'hi' ? 'आगे बढ़ें' : 'Continue'
            : language === 'hi' ? 'आगे' : 'Next'}
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
