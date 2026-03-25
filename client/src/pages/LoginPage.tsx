import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    <div className="min-h-screen flex">
      {/* Left — editorial brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1c1810] flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2010]/80 to-[#0e0c08]/80" />

        <div className="relative z-10">
          <span className="font-label text-[10px] uppercase tracking-[0.25rem] text-[#f8d056]/60">
            Wedding Atelier
          </span>
          <h1 className="font-headline italic text-5xl text-[#fff8f0] mt-4 leading-tight">
            Vows &amp; Plans
          </h1>
        </div>

        <div className="relative z-10">
          <div className="h-px w-12 bg-[#f8d056]/40 mb-8" />
          <p className="font-headline italic text-2xl text-[#fff8f0]/80 leading-relaxed max-w-xs">
            "Every great love story deserves an equally beautiful chapter of planning."
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-[#f8d056]/50 mt-6">
            — The Atelier
          </p>
        </div>

        <div className="relative z-10">
          <p className="font-label text-[10px] uppercase tracking-[0.15rem] text-[#fff8f0]/30">
            © {new Date().getFullYear()} Vows &amp; Plans
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden mb-12">
            <h1 className="font-headline italic text-4xl text-on-surface">Vows &amp; Plans</h1>
            <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-on-surface-variant">
              Wedding Atelier
            </span>
          </div>

          <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-3">
            Welcome back
          </span>
          <h2 className="font-headline text-4xl text-on-surface mb-12">
            Sign in to your<br />
            <span className="italic">planning suite</span>
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <Input
              label="Email address"
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

            <Button type="submit" loading={isLoading} className="w-full mt-4">
              Continue
            </Button>
          </form>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="font-label text-[10px] uppercase tracking-[0.15rem] text-on-surface-variant">
              New here?
            </span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <p className="mt-6 text-center">
            <Link
              to="/register"
              className="font-label text-xs uppercase tracking-[0.1rem] text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-8 text-center font-label text-[10px] uppercase tracking-[0.1rem] text-on-surface-variant/50">
            Demo: demo@weddingplanner.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
