import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  CookingPot,
  Flame,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getExpiryStatus, formatCurrency } from '../lib/formatters';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useGroceryStore } from '../store/useGroceryStore';
import { usePantryStore } from '../store/usePantryStore';
import { useUIStore } from '../store/useUIStore';

const QUICK_LINKS = [
  {
    to: '/grocery',
    title: 'Grocery List',
    description: 'Add weekly essentials and share with family.',
    icon: ShoppingCart,
    accent: 'bg-brand-500 text-white shadow-soft',
  },
  {
    to: '/prices',
    title: 'Compare Prices',
    description: 'Blinkit, Zepto, BigBasket and more.',
    icon: TrendingUp,
    accent: 'bg-money-500 text-white',
  },
  {
    to: '/meals',
    title: 'Meal Planner',
    description: 'Use pantry items before they expire.',
    icon: CookingPot,
    accent: 'bg-accent-500 text-white',
  },
  {
    to: '/assistant',
    title: 'Ask Oikos',
    description: 'Recipes, budget advice and shopping help.',
    icon: Bot,
    accent: 'bg-gradient-to-br from-brand-500 to-money-500 text-white',
  },
];

const STATUS_CARDS = [
  {
    key: 'pending',
    title: 'Pending Items',
    helper: 'Still left in active grocery list',
    icon: ShoppingCart,
    route: '/grocery',
    iconWrap: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  },
  {
    key: 'expiring',
    title: 'Expiring Soon',
    helper: 'Pantry items to use this week',
    icon: TriangleAlert,
    route: '/pantry',
    iconWrap: 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300',
  },
  {
    key: 'spent',
    title: 'Spent This Month',
    helper: 'Current grocery and household spend',
    icon: BadgeIndianRupee,
    route: '/finance',
    iconWrap: 'bg-money-50 text-money-600 dark:bg-money-500/15 dark:text-money-300',
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const {
    lists,
    items,
    activeListId,
    fetchLists,
    fetchItems,
  } = useGroceryStore();
  const pantryItems = usePantryStore((state) => state.items);
  const fetchPantryItems = usePantryStore((state) => state.fetchItems);
  const financeSummary = useFinanceStore((state) => state.summary);
  const fetchFinance = useFinanceStore((state) => state.fetchAll);
  const streak = useUIStore((s) => s.streak);
  const bumpStreak = useUIStore((s) => s.bumpStreak);

  useEffect(() => {
    fetchLists();
    fetchPantryItems();
    fetchFinance();
    bumpStreak();
  }, [bumpStreak, fetchFinance, fetchLists, fetchPantryItems]);

  useEffect(() => {
    if (activeListId) {
      fetchItems(activeListId);
    }
  }, [activeListId, fetchItems]);

  const stats = useMemo(() => {
    const activeItems = items[activeListId] || [];
    const pendingItems = activeItems.filter((item) => !item.is_checked).length;
    const expiringSoon = pantryItems.filter((item) => {
      const status = getExpiryStatus(item.expiry_date);
      return status && ['today', 'critical', 'warning', 'expired'].includes(status.status);
    }).length;

    return {
      pending: pendingItems,
      expiring: expiringSoon,
      spent: formatCurrency(financeSummary?.total_expense || 0),
    };
  }, [activeListId, financeSummary?.total_expense, items, pantryItems]);

  const valueStrip = useMemo(() => {
    const spent = financeSummary?.total_expense || 0;
    const budget = financeSummary?.budget || 0;
    const saved = budget > spent ? budget - spent : 0;
    return {
      saved: formatCurrency(saved),
      spent: formatCurrency(spent),
      pantryUsed: pantryItems.filter((i) => i.is_used || i.used_at).length,
    };
  }, [financeSummary?.total_expense, financeSummary?.budget, pantryItems]);

  const greeting =
    user?.name && user.name !== 'Oikos User' ? `Welcome, ${user.name}` : 'Welcome';
  const activeList = lists.find((list) => list.id === activeListId);

  return (
    <div className="page-container space-y-5">
      <Card className="relative overflow-hidden border-0 bg-brand-gradient p-0 text-white shadow-glow">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-accent-400/30 blur-2xl" />
        <div className="relative px-5 py-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/85">{greeting}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">The Intelligence Behind Household Wealth</h2>
              <p className="mt-2 max-w-xs text-sm text-white/85">
                Track groceries, compare prices, plan meals and keep your
                household budget in one place.
              </p>
            </div>
            <div className="rounded-3xl bg-white/20 p-3 backdrop-blur-sm ring-1 ring-white/30">
              <Sparkles size={24} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
              <p className="text-[11px] uppercase tracking-wider text-white/75">
                Active List
              </p>
              <p className="mt-1 truncate text-base font-semibold">
                {activeList?.name || 'Weekly Essentials'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
              <p className="text-[11px] uppercase tracking-wider text-white/75">
                Budget Used
              </p>
              <p className="mt-1 text-base font-semibold">
                {financeSummary?.budget_used_pct ?? 0}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-money-100 bg-white p-3 shadow-card dark:border-money-900/40 dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-money-600 dark:text-money-300">
            <PiggyBank size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Saved</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{valueStrip.saved}</p>
          <p className="text-[10px] text-gray-400">this month</p>
        </div>
        <div className="rounded-2xl border border-accent-100 bg-white p-3 shadow-card dark:border-accent-900/40 dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-accent-600 dark:text-accent-300">
            <Flame size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Streak</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {streak.count}<span className="ml-1 text-sm font-medium text-gray-500">d</span>
          </p>
          <p className="text-[10px] text-gray-400">{streak.count > 0 ? 'keep going' : 'start today'}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-3 shadow-card dark:border-brand-900/40 dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-300">
            <CookingPot size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Used</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{valueStrip.pantryUsed}</p>
          <p className="text-[10px] text-gray-400">pantry items</p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-title mb-0">Today&apos;s Snapshot</h3>
          <Link
            to="/finance"
            className="text-sm font-medium text-brand-600 dark:text-brand-300 hover:underline"
          >
            Details
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {STATUS_CARDS.map(({ key, title, helper, icon: Icon, route, iconWrap }) => (
            <Link key={key} to={route}>
              <Card className="px-4 py-4 transition-shadow hover:shadow-soft">
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl p-3 ${iconWrap}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="mt-0.5 text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {stats[key]}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{helper}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="flex-shrink-0 text-gray-400 dark:text-gray-500"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-title mb-0">Quick Actions</h3>
          <span className="text-xs text-gray-400">
            Built for fast household planning
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {QUICK_LINKS.map(({ to, title, description, icon: Icon, accent }) => (
            <Link key={to} to={to}>
              <Card className="px-4 py-4 transition-shadow hover:shadow-soft">
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl p-3 ${accent}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="flex-shrink-0 text-gray-400 dark:text-gray-500"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 via-gray-900 to-brand-900 px-5 py-5 text-white dark:from-gray-800 dark:to-brand-900">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-500/30 blur-2xl" />
        <p className="relative text-sm text-gray-300">
          Shared lists are supported through WhatsApp links and share codes.
        </p>
        <p className="relative mt-1 text-lg font-semibold">
          Invite family members without needing email.
        </p>
        <div className="relative mt-4">
          <Link to="/grocery">
            <Button variant="primary">
              Open Grocery List
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
