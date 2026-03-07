import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  CheckSquare,
  Calendar,
  Plus,
  Heart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useWeddingStore } from '../store/weddingStore';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

function DaysCountdown({ date }: { date: string | null }) {
  if (!date) return <span className="text-gray-400 text-sm">No date set</span>;
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return (
    <div className="text-center">
      <div className="font-heading text-5xl font-bold text-blush-400">{days}</div>
      <div className="text-xs text-gray-500 mt-1">days to go</div>
    </div>
  );
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
    return [
      {
        name: 'Total',
        Estimated: estimated,
        Actual: actual,
      },
    ];
  }, [expenses]);

  const stats = [
    {
      label: 'Guests',
      value: `${acceptedGuests}/${totalGuests}`,
      sub: 'accepted',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-50',
      to: '/guests',
    },
    {
      label: 'Budget Used',
      value: `${budgetPct}%`,
      sub: `$${totalSpent.toLocaleString()} of $${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: budgetPct > 100 ? 'text-red-500' : 'text-green-500',
      bg: budgetPct > 100 ? 'bg-red-50' : 'bg-green-50',
      to: '/budget',
    },
    {
      label: 'Tasks Left',
      value: String(pendingTasks),
      sub: `of ${tasks.length} total`,
      icon: CheckSquare,
      color: 'text-champagne-500',
      bg: 'bg-champagne-300/20',
      to: '/tasks',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal">
          {wedding?.partner1Name && wedding?.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}'s Wedding`
            : 'Your Wedding Dashboard'}
        </h1>
        {wedding?.venueName && (
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium">{wedding.venueName}</span>
            {wedding.venueAddress ? ` · ${wedding.venueAddress}` : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stat cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading
            ? [1, 2, 3].map((i) => <CardSkeleton key={i} />)
            : stats.map(({ label, value, sub, icon: Icon, color, bg, to }) => (
                <Link key={label} to={to} className="card hover:shadow-warm-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {label}
                    </p>
                    <div className={`rounded-full p-2 ${bg}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                  </div>
                  <p className={`font-heading text-3xl font-bold ${color}`}>{value}</p>
                  <p className="mt-1 text-xs text-gray-400">{sub}</p>
                </Link>
              ))}
        </div>

        {/* Countdown */}
        <div className="card flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blush-100">
            <Heart className="h-6 w-6 text-blush-400 fill-blush-300" />
          </div>
          <DaysCountdown date={wedding?.date ?? null} />
          {wedding?.date && (
            <p className="text-xs text-gray-400">
              {new Date(wedding.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
          {!wedding?.date && (
            <Link to="/settings">
              <Button variant="secondary" size="sm">
                <Calendar className="h-3.5 w-3.5" />
                Set date
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Upcoming tasks widget */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold">Upcoming Tasks</h2>
          <Link to="/tasks">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-10 w-10 text-blush-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No upcoming tasks.</p>
            <Link to="/tasks" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Add a task
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-blush-50">
            {upcomingTasks.map((task) => {
              const isOverdue =
                task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
              return (
                <li key={task.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-2 w-2 rounded-full bg-blush-300 flex-shrink-0" />
                    <span className="text-sm truncate">{task.title}</span>
                    {task.category && (
                      <Badge variant="gray" className="hidden sm:inline-flex flex-shrink-0">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                  {task.dueDate && (
                    <span
                      className={`text-xs flex-shrink-0 font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Budget Snapshot */}
      <div className="card">
        <h2 className="font-heading text-xl font-semibold mb-4">Budget Snapshot</h2>
        {isLoading ? (
          <div className="h-64 skeleton rounded-lg" />
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-10 w-10 text-blush-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No expenses yet.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Estimated" fill="#E8A0BF" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Actual" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-heading text-xl font-semibold mb-4">Quick Add</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/guests">
            <Button variant="secondary" size="sm" icon={<Users className="h-4 w-4" />}>
              Add Guest
            </Button>
          </Link>
          <Link to="/budget">
            <Button variant="secondary" size="sm" icon={<DollarSign className="h-4 w-4" />}>
              Add Expense
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="secondary" size="sm" icon={<CheckSquare className="h-4 w-4" />}>
              Add Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
