'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BadgeIndianRupee, Bot, CookingPot,
  ShoppingCart, Sparkles, TrendingUp, TriangleAlert,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getExpiryStatus, formatCurrency } from '@/lib/formatters';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useGroceryStore } from '@/store/useGroceryStore';
import { usePantryStore } from '@/store/usePantryStore';

const QUICK_LINKS = [
  { to: '/grocery', title: 'Grocery List', description: 'Add weekly essentials and share with family.', icon: ShoppingCart, accent: 'bg-saffron-500 text-white' },
  { to: '/prices', title: 'Compare Prices', description: 'Blinkit, Zepto, BigBasket and more.', icon: TrendingUp, accent: 'bg-kgreen-500 text-white' },
  { to: '/meals', title: 'Meal Planner', description: 'Use pantry items before they expire.', icon: CookingPot, accent: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' },
  { to: '/assistant', title: 'Ask Omni', description: 'Recipes, budget advice and shopping help.', icon: Bot, accent: 'bg-white text-saffron-600 border border-saffron-200 dark:bg-gray-900 dark:text-saffron-300 dark:border-saffron-900/40' },
];

const STATUS_CARDS = [
  { key: 'pending', title: 'Pending Items', helper: 'Still left in active grocery list', icon: ShoppingCart, route: '/grocery' },
  { key: 'expiring', title: 'Expiring Soon', helper: 'Pantry items to use this week', icon: TriangleAlert, route: '/pantry' },
  { key: 'spent', title: 'Spent This Month', helper: 'Current grocery and household spend', icon: BadgeIndianRupee, route: '/finance' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { lists, items, activeListId, fetchLists, fetchItems } = useGroceryStore();
  const pantryItems = usePantryStore((s) => s.items);
  const fetchPantryItems = usePantryStore((s) => s.fetchItems);
  const financeSummary = useFinanceStore((s) => s.summary) as Record<string, number> | null;
  const fetchFinance = useFinanceStore((s) => s.fetchAll);

  useEffect(() => {
    fetchLists();
    fetchPantryItems();
    fetchFinance();
  }, [fetchFinance, fetchLists, fetchPantryItems]);

  useEffect(() => {
    if (activeListId) fetchItems(activeListId);
  }, [activeListId, fetchItems]);

  const stats = useMemo(() => {
    const activeItems = (activeListId ? items[activeListId] : []) || [];
    const pendingItems = activeItems.filter((i) => !i.is_checked).length;
    const expiringSoon = pantryItems.filter((item) => {
      const s = getExpiryStatus(item.expiry_date);
      return s && ['today', 'critical', 'warning', 'expired'].includes(s.status);
    }).length;
    return {
      pending: pendingItems,
      expiring: expiringSoon,
      spent: formatCurrency(financeSummary?.total_expense || 0),
    };
  }, [activeListId, financeSummary, items, pantryItems]);

  const greeting =
    user?.name && user.name !== 'Omni User' ? `Namaste, ${user.name}` : 'Namaste';
  const activeList = lists.find((l) => l.id === activeListId);

  return (
    <div className="page-container space-y-5">
      <Card className="overflow-hidden bg-gradient-to-br from-saffron-500 via-saffron-500 to-kgreen-600 p-0 text-white">
        <div className="px-5 py-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/80">{greeting}</p>
              <h2 className="mt-1 text-2xl font-semibold">All your home, in one place</h2>
              <p className="mt-2 max-w-xs text-sm text-white/80">
                Track groceries, compare prices, plan meals and keep your household budget in one place.
              </p>
            </div>
            <div className="rounded-3xl bg-white/15 p-3 backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-white/70">Active List</p>
              <p className="mt-1 text-base font-semibold">{activeList?.name || 'Weekly Essentials'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-white/70">Budget Used</p>
              <p className="mt-1 text-base font-semibold">{financeSummary?.budget_used_pct ?? 0}%</p>
            </div>
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-title mb-0">Today&apos;s Snapshot</h3>
          <Link href="/finance" className="text-sm font-medium text-saffron-600 dark:text-saffron-400">Details</Link>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {STATUS_CARDS.map(({ key, title, helper, icon: Icon, route }) => (
            <Link key={key} href={route}>
              <Card className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-gray-100 p-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="mt-0.5 text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {stats[key as keyof typeof stats]}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{helper}</p>
                  </div>
                  <ArrowRight size={18} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-title mb-0">Quick Actions</h3>
          <span className="text-xs text-gray-400">Built for fast household planning</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {QUICK_LINKS.map(({ to, title, description, icon: Icon, accent }) => (
            <Link key={to} href={to}>
              <Card className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl p-3 ${accent}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                  <ArrowRight size={18} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="bg-gray-900 px-5 py-5 text-white dark:bg-gray-800">
        <p className="text-sm text-gray-300">Shared lists are supported through WhatsApp links and share codes.</p>
        <p className="mt-1 text-lg font-semibold">Invite family members without needing email.</p>
        <div className="mt-4">
          <Link href="/grocery">
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
