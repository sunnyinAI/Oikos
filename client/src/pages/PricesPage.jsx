import { useState } from 'react';
import { Search, Star, Clock, ShoppingBag, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { comparePrices, affiliateRedirect } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { useEffect } from 'react';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { useUIStore } from '../store/useUIStore';

const QUICK_SEARCHES = ['Tomato', 'Onion', 'Potato', 'Milk', 'Paneer', 'Rice', 'Atta', 'Toor Dal', 'Ghee'];

const PLATFORM_LOGOS = {
  blinkit: '🟡',
  zepto: '🟣',
  swiggy_instamart: '🟠',
  bigbasket: '🟢',
  jiomart: '🔵',
};

// Backend platform key -> affiliate vendor key
const VENDOR_MAP = {
  blinkit: 'blinkit',
  zepto: 'zepto',
  bigbasket: 'bigbasket',
  swiggy_instamart: 'swiggyinstamart',
  jiomart: null, // no affiliate yet
};

const VENDOR_COLORS = {
  blinkit: 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950',
  zepto: 'bg-violet-600 hover:bg-violet-700 text-white',
  bigbasket: 'bg-lime-600 hover:bg-lime-700 text-white',
  swiggyinstamart: 'bg-orange-500 hover:bg-orange-600 text-white',
};

export default function PricesPage() {
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 600);
  const addToast = useUIStore((s) => s.addToast);

  const handleBuy = async (platformKey, productName) => {
    const vendor = VENDOR_MAP[platformKey];
    if (!vendor) {
      addToast('Buy link not available for this platform yet', 'info');
      return;
    }
    try {
      const { url } = await affiliateRedirect(vendor, productName);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      addToast(err.message || 'Could not open link', 'error');
    }
  };

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) { setResult(null); return; }
    setLoading(true);
    comparePrices(debouncedQuery, parseFloat(qty) || 1, 'kg')
      .then(setResult).catch(() => setResult(null)).finally(() => setLoading(false));
  }, [debouncedQuery, qty]);

  const available = result?.results?.filter((r) => r.available) || [];
  const unavailable = result?.results?.filter((r) => !r.available) || [];

  return (
    <div className="page-container">
      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 text-gray-900 dark:text-gray-100"
            placeholder="Search product (e.g. Tomato, Paneer...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-saffron-400 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Quick searches */}
      {!query && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Quick Search</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {QUICK_SEARCHES.map((q) => (
              <button key={q} onClick={() => setQuery(q)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:border-saffron-300 transition-colors">
                {q}
              </button>
            ))}
          </div>
          <EmptyState icon="🔍" title="Compare prices across apps" description="Search any grocery item to see prices on Blinkit, Zepto, BigBasket, JioMart & Swiggy Instamart" />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      )}

      {result && !loading && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {result.item} ({qty} kg)
              </h2>
              {available.length > 0 && (
                <span className="text-xs text-kgreen-600 dark:text-kgreen-400 font-medium bg-kgreen-50 dark:bg-kgreen-900/20 px-2 py-1 rounded-full">
                  {available.length} platforms
                </span>
              )}
            </div>

            <div className="space-y-3">
              {available.map((platform, i) => (
                <motion.div key={platform.platform} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-white dark:bg-gray-800 border rounded-2xl p-4 ${platform.is_best ? 'border-kgreen-500 dark:border-kgreen-600' : 'border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{PLATFORM_LOGOS[platform.platform] || '🛒'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">{platform.name}</span>
                          {platform.is_best && <span className="text-xs bg-kgreen-100 dark:bg-kgreen-900/30 text-kgreen-700 dark:text-kgreen-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Star size={10} /> Best Deal</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={10} /> {platform.delivery_time}</span>
                          {platform.min_order > 0 && <span className="flex items-center gap-1"><ShoppingBag size={10} /> Min ₹{platform.min_order}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{platform.price}</div>
                      {platform.discount_pct > 0 && (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-xs text-gray-400 line-through">₹{platform.mrp}</span>
                          <span className="text-xs text-kgreen-600 dark:text-kgreen-400 font-medium">{platform.discount_pct}% off</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Price bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${platform.is_best ? 'bg-money-500' : 'bg-brand-400'}`}
                        style={{ width: `${Math.max(20, 100 - ((platform.price - Math.min(...available.map(p => p.price))) / Math.max(...available.map(p => p.price)) * 60))}%` }}
                      />
                    </div>
                  </div>
                  {/* Buy CTA */}
                  {VENDOR_MAP[platform.platform] && (
                    <button
                      onClick={() => handleBuy(platform.platform, result.item)}
                      className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-soft transition-all active:scale-95 ${VENDOR_COLORS[VENDOR_MAP[platform.platform]] || 'bg-brand-500 hover:bg-brand-600 text-white'}`}
                    >
                      Buy on {platform.name}
                      <ExternalLink size={14} />
                    </button>
                  )}
                </motion.div>
              ))}

              {unavailable.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-2">Not available on: {unavailable.map(p => p.name).join(', ')}</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
