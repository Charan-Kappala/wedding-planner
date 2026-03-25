import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  CheckSquare,
  Calendar,
  Plus,
  Heart,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useWeddingStore } from '../store/weddingStore';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

function DaysCountdown({ date }: { date: string | null }) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return <span>{days}</span>;
}

export default function DashboardPage() {
  const { wedding, guests, tasks, expenses, loading, fetchGuests, fetchTasks, fetchExpenses } =
    useWeddingStore();

  useEffect(() => {
    fetchGuests();
    fetchTasks();
    fetchExpenses();
  }, [fetchGuests, fetchTasks, fetchExpenses]);

  const isLoading = loading.guests || loading.tasks || loading.expenses;

  const totalGuests = guests.length;
  const acceptedGuests = guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length;
  const totalBudget = wedding?.budget ?? 0;
  const totalSpent = expenses.reduce((sum, e) => sum + (e.actual ?? e.estimated), 0);
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const budgetData = useMemo(() => {
    const estimated = expenses.reduce((sum, e) => sum + e.estimated, 0);
    const actual = expenses.reduce((sum, e) => sum + (e.actual || 0), 0);
    return [{ name: 'Total', Estimated: estimated, Actual: actual }];
  }, [expenses]);

  return (
    <div>
      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="mb-16">
        <span className="font-label text-[10px] uppercase tracking-[0.25rem] text-primary block mb-4">
          Your Dashboard
        </span>
        <h1 className="font-headline text-5xl sm:text-6xl lg:text-7xl text-on-surface leading-tight">
          {wedding?.partner1Name && wedding?.partner2Name ? (
            <>
              {wedding.partner1Name} &amp;<br />
              <span className="italic">{wedding.partner2Name}</span>
            </>
          ) : (
            <>Curating your<br /><span className="italic">unforgettable</span> day</>
          )}
        </h1>
        {wedding?.venueName && (
          <p className="mt-4 font-body text-sm text-on-surface-variant">
            {wedding.venueName}{wedding.venueAddress ? ` · ${wedding.venueAddress}` : ''}
          </p>
        )}
      </div>

      {/* ── Countdown + date ────────────────────────────────────── */}
      {wedding?.date && (
        <div className="mb-16 bg-[#1c1810] rounded-xl p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.25rem] text-[#f8d056]/60 block mb-4">
              Countdown
            </span>
            <div className="flex items-end gap-3">
              <span className="font-headline text-7xl sm:text-8xl text-[#fff8f0] leading-none">
                <DaysCountdown date={wedding.date} />
              </span>
              <span className="font-label text-[10px] uppercase tracking-[0.15rem] text-[#fff8f0]/50 mb-3">
                Days<br />to go
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <Heart className="h-5 w-5 text-[#f8d056] fill-[#f8d056]/30 mb-3 sm:ml-auto" />
            <p className="font-headline italic text-2xl text-[#fff8f0]/90">
              {new Date(wedding.date).toLocaleDateString('en-US', {
                weekday: 'long',
              })}
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest text-[#fff8f0]/50 mt-1">
              {new Date(wedding.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* ── Asymmetric stats section ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
        {/* Left: section label */}
        <div className="md:col-span-4 md:pt-2">
          <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-4">
            At a Glance
          </span>
          <p className="font-headline text-3xl text-on-surface leading-snug">
            Your wedding,<br />beautifully<br />
            <span className="italic">on track</span>
          </p>
          {!wedding?.date && (
            <Link to="/settings" className="inline-flex items-center gap-2 mt-6 font-label text-[10px] uppercase tracking-widest text-primary border-b border-primary/30 pb-0.5 hover:border-primary transition-colors">
              <Calendar className="h-3 w-3" />
              Set your date
            </Link>
          )}
        </div>

        {/* Right: stat cards staggered */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <Link
                to="/guests"
                className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow hover:-translate-y-2 transition-transform duration-300 group"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="rounded-full p-2.5 bg-surface-container-low group-hover:bg-primary-container transition-colors">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-outline-variant group-hover:text-primary transition-colors" />
                </div>
                <p className="font-headline text-4xl text-on-surface mb-2">{acceptedGuests}<span className="text-on-surface-variant text-2xl">/{totalGuests}</span></p>
                <p className="font-label text-[10px] uppercase tracking-[0.15rem] text-on-surface-variant">Guests Accepted</p>
              </Link>

              <Link
                to="/budget"
                className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow hover:-translate-y-2 transition-transform duration-300 sm:mt-8 group"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="rounded-full p-2.5 bg-surface-container-low group-hover:bg-primary-container transition-colors">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-outline-variant group-hover:text-primary transition-colors" />
                </div>
                <p className={`font-headline text-4xl mb-2 ${budgetPct > 100 ? 'text-error' : 'text-on-surface'}`}>
                  {budgetPct}<span className="text-on-surface-variant text-2xl">%</span>
                </p>
                <p className="font-label text-[10px] uppercase tracking-[0.15rem] text-on-surface-variant">Budget Used</p>
                <p className="font-body text-xs text-on-surface-variant/70 mt-1">${totalSpent.toLocaleString()} of ${totalBudget.toLocaleString()}</p>
              </Link>

              <Link
                to="/tasks"
                className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow hover:-translate-y-2 transition-transform duration-300 group"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="rounded-full p-2.5 bg-surface-container-low group-hover:bg-primary-container transition-colors">
                    <CheckSquare className="h-4 w-4 text-primary" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-outline-variant group-hover:text-primary transition-colors" />
                </div>
                <p className="font-headline text-4xl text-on-surface mb-2">{pendingTasks}</p>
                <p className="font-label text-[10px] uppercase tracking-[0.15rem] text-on-surface-variant">Tasks Remaining</p>
                <p className="font-body text-xs text-on-surface-variant/70 mt-1">of {tasks.length} total</p>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Two-column lower section ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Upcoming tasks — 7 cols */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-10 editorial-shadow">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-2">
                Upcoming
              </span>
              <h2 className="font-headline text-3xl text-on-surface">Tasks</h2>
            </div>
            <Link to="/tasks" className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/50 pb-0.5 hover:text-primary hover:border-primary transition-colors">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 skeleton rounded" />)}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="py-12 text-center">
              <CheckSquare className="h-10 w-10 text-outline-variant mx-auto mb-4" />
              <p className="font-body text-sm text-on-surface-variant mb-5">No upcoming tasks.</p>
              <Link to="/tasks">
                <Button variant="secondary" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Add a task
                </Button>
              </Link>
            </div>
          ) : (
            <ul>
              {upcomingTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <li key={task.id} className="flex items-center justify-between py-4 gap-4 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-outline-variant/10">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="font-body text-sm text-on-surface truncate">{task.title}</span>
                      {task.category && (
                        <Badge variant="gray" className="hidden sm:inline-flex flex-shrink-0">{task.category}</Badge>
                      )}
                    </div>
                    {task.dueDate && (
                      <span className={`font-label text-[10px] uppercase tracking-[0.1rem] flex-shrink-0 ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick actions — 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Budget snapshot */}
          <div className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow flex-1">
            <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-2">
              Finances
            </span>
            <h2 className="font-headline text-3xl text-on-surface mb-6">Budget</h2>
            {isLoading ? (
              <div className="h-32 skeleton rounded" />
            ) : expenses.length === 0 ? (
              <div className="py-6 text-center">
                <DollarSign className="h-8 w-8 text-outline-variant mx-auto mb-3" />
                <p className="font-body text-sm text-on-surface-variant">No expenses yet.</p>
              </div>
            ) : (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontFamily: 'Manrope', fontSize: 10, fill: '#665e4d' }} />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontFamily: 'Manrope', fontSize: 11, borderRadius: '0.25rem', border: '1px solid rgba(187,177,156,0.2)' }} />
                    <Legend wrapperStyle={{ fontFamily: 'Manrope', fontSize: 10 }} />
                    <Bar dataKey="Estimated" fill="#ffe088" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Actual" fill="#735c00" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick add */}
          <div className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow">
            <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-on-surface-variant block mb-5">
              Quick Add
            </span>
            <div className="flex flex-col gap-2">
              <Link to="/guests" className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-body text-sm text-on-surface">Add Guest</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-outline-variant group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/budget" className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-body text-sm text-on-surface">Add Expense</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-outline-variant group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/tasks" className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="font-body text-sm text-on-surface">Add Task</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-outline-variant group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
