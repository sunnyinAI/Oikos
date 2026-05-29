'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CookingPot, RefreshCw } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { formatDate, formatWeekRange, getMonday } from '@/lib/formatters';
import { generateMealPlan, getMealPlan } from '@/lib/api';
import { useUIStore } from '@/store/useUIStore';

const MEAL_KEYS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
];

const shiftWeek = (weekStart: string, delta: number): string => {
  const next = new Date(weekStart);
  next.setDate(next.getDate() + delta * 7);
  return next.toISOString().split('T')[0];
};

interface MealItem {
  name: string; name_hi?: string; cuisine?: string; time_mins?: number;
  ingredients?: string[];
}
interface DayPlan { date: string; meals: Record<string, MealItem>; }
interface PlanData {
  days?: DayPlan[];
  estimated_cost?: number;
  shopping_list?: { name: string; quantity: number; unit: string }[];
  plan_json?: PlanData;
}

export default function MealsPage() {
  const [weekStart, setWeekStart] = useState(getMonday());
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const { addToast } = useUIStore();

  useEffect(() => {
    let active = true;
    setLoading(true);
    (getMealPlan(weekStart) as Promise<PlanData>)
      .then((data) => { if (active) setPlan(data); })
      .catch(() => { if (active) addToast('Unable to load meal plan', 'error'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [addToast, weekStart]);

  const planData = useMemo(() => (plan as PlanData & { plan_json?: PlanData })?.plan_json || plan, [plan]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await generateMealPlan(weekStart) as PlanData;
      setPlan(data);
      setAiUnavailable(false);
      addToast('Weekly plan generated', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed';
      const isAiError = msg.includes('ANTHROPIC_API_KEY');
      setAiUnavailable(isAiError);
      addToast(isAiError ? 'Set ANTHROPIC_API_KEY in server to generate AI meal plans' : msg, 'error');
    } finally { setGenerating(false); }
  };

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekStart((c) => shiftWeek(c, -1))} className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500">Meal Planner</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{formatWeekRange(weekStart)}</p>
        </div>
        <button onClick={() => setWeekStart((c) => shiftWeek(c, 1))} className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      <Card className="bg-gradient-to-br from-white to-saffron-50 px-5 py-5 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pantry-aware weekly planning</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Build an Indian meal plan in one tap</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Omni uses saved pantry items and household preferences to suggest breakfast, lunch and dinner for the full week.
            </p>
          </div>
          <div className="rounded-3xl bg-saffron-500 p-3 text-white"><CookingPot size={22} /></div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={handleGenerate} loading={generating}><RefreshCw size={16} /> Generate Plan</Button>
          {planData?.estimated_cost && (
            <Badge color="green">Est. {new Intl.NumberFormat('en-IN').format(planData.estimated_cost)}</Badge>
          )}
        </div>
      </Card>

      {aiUnavailable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          AI generation is disabled. Configure <code>ANTHROPIC_API_KEY</code> in the server <code>.env</code> to enable it.
        </div>
      )}

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && !planData?.days?.length && (
        <EmptyState icon="🍽️" title="No meal plan for this week"
          description="Generate a weekly plan using your pantry and household preferences."
          action={<Button onClick={handleGenerate}>Generate Meal Plan</Button>} />
      )}

      {!loading && planData?.days && planData.days.length > 0 && (
        <>
          <div className="space-y-3">
            {planData.days.map((day) => (
              <Card key={day.date} className="px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(day.date)}</p>
                    <p className="text-xs text-gray-400">Indian home-style recommendations</p>
                  </div>
                  <Badge color="saffron">Family Week</Badge>
                </div>
                <div className="space-y-3">
                  {MEAL_KEYS.map(({ key, label }) => {
                    const meal = day.meals?.[key];
                    if (!meal) return null;
                    return (
                      <div key={key} className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
                            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{meal.name}</p>
                            {meal.name_hi && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-devanagari">{meal.name_hi}</p>}
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p>{meal.cuisine || 'Indian'}</p>
                            <p>{meal.time_mins || 20} mins</p>
                          </div>
                        </div>
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {meal.ingredients.slice(0, 6).map((ing) => (
                              <span key={ing} className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">{ing}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          {planData.shopping_list && planData.shopping_list.length > 0 && (
            <Card className="px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Shopping List from Plan</h3>
                <Badge color="blue">{planData.shopping_list.length} items</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {planData.shopping_list.map((item) => (
                  <span key={`${item.name}-${item.unit}`} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {item.name} · {item.quantity} {item.unit}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
