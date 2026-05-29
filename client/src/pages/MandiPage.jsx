import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCommodities, getMandiPrices } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function MandiPage() {
  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('tomato');
  const [selectedState, setSelectedState] = useState('MH');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUIStore();

  useEffect(() => {
    getCommodities().then(({ commodities, states }) => { setCommodities(commodities); setStates(states); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCommodity) return;
    setLoading(true);
    getMandiPrices(selectedCommodity, selectedState)
      .then(setData).catch(() => addToast('Failed to fetch mandi prices', 'error')).finally(() => setLoading(false));
  }, [addToast, selectedCommodity, selectedState]);

  const trending = (changePct) => {
    if (changePct > 2) return { icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (changePct < -2) return { icon: TrendingDown, color: 'text-kgreen-600', bg: 'bg-kgreen-50 dark:bg-kgreen-900/20' };
    return { icon: Minus, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' };
  };

  return (
    <div className="page-container">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Commodity</label>
          <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 text-gray-900 dark:text-gray-100">
            {commodities.map((c) => <option key={c.id} value={c.id}>{c.name} / {c.name_hi}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">State</label>
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 text-gray-900 dark:text-gray-100">
            {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {!loading && data && (
        <>
          {/* Insight card */}
          {data.insight && (
            <div className={`rounded-2xl p-4 mb-4 ${data.insight.savings_pct > 20 ? 'bg-kgreen-50 dark:bg-kgreen-900/20 border border-kgreen-200 dark:border-kgreen-800' : 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{data.insight.savings_pct > 20 ? '💡' : 'ℹ️'}</span>
                <div>
                  <p className={`font-medium text-sm ${data.insight.savings_pct > 20 ? 'text-kgreen-800 dark:text-kgreen-300' : 'text-brand-800 dark:text-brand-300'}`}>
                    {data.insight.recommendation}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <div><span className="text-gray-500">Mandi price:</span> <span className="font-semibold">₹{data.insight.mandi_price_per_kg}/kg</span></div>
                    <div><span className="text-gray-500">App delivery:</span> <span className="font-semibold">₹{data.insight.app_delivery_price_per_kg}/kg</span></div>
                    {data.insight.savings_pct > 0 && <div><span className="text-kgreen-600 font-semibold">{data.insight.savings_pct}% cheaper at mandi</span></div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {data.commodity?.name} Prices — {states.find(s => s.code === selectedState)?.name}
          </h3>

          <div className="space-y-3">
            {data.results?.map((r, i) => {
              const trend = trending(r.change_pct);
              const TrendIcon = trend.icon;
              return (
                <motion.div key={r.mandi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{r.mandi}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Per {r.unit} · Updated today</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{r.modal_price}</p>
                      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trend.bg} ${trend.color}`}>
                        <TrendIcon size={10} />
                        {Math.abs(r.change_pct)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Min: ₹{r.min_price}</span>
                    <span>Max: ₹{r.max_price}</span>
                    <span>Prev: ₹{r.prev_price}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">Data sourced from Agmarknet. Prices in ₹ per Quintal unless noted.</p>
        </>
      )}

      {!loading && !data && (
        <EmptyState icon="🌾" title="Select a commodity" description="View live mandi prices from Agmarknet across Indian states" />
      )}
    </div>
  );
}
