import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  function validate() {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Login failed. Please try again.';
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blush-100 mb-4">
            <Heart className="h-8 w-8 text-blush-400 fill-blush-300" />
          </div>
          <h1 className="font-heading text-4xl font-semibold text-charcoal">Wedding Planner</h1>
          <p className="mt-1 text-sm text-gray-500">Your perfect day, beautifully organized.</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="font-heading text-2xl font-semibold text-charcoal mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blush-400 hover:text-blush-500 underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Demo: demo@weddingplanner.com / password123
        </p>
      </div>
    </div>
  );
}
