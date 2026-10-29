import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await authApi.register(name, email, password);
      } else {
        res = await authApi.login(email, password);
      }
      const { user, token } = res.data.data!;
      setAuth(user, token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login (bypass backend)
  const demoLogin = () => {
    setAuth({
      _id: 'demo',
      name: 'Demo User',
      email: 'demo@webcraft.studio',
      createdAt: new Date().toISOString(),
    }, 'demo-token');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-surface-900 via-brand-950 to-surface-950 p-12 border-r border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">WebCraft Studio</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Build websites<br />without code.
          </h1>
          <p className="text-surface-400 text-lg leading-relaxed max-w-sm">
            Drag, drop, customize. Create professional websites in minutes with our visual editor.
          </p>
        </div>
        <div className="flex gap-8">
          {[{ n: '10K+', l: 'Websites Built' }, { n: '50+', l: 'Templates' }, { n: '99.9%', l: 'Uptime' }].map(stat => (
            <div key={stat.n}>
              <p className="text-2xl font-bold text-white">{stat.n}</p>
              <p className="text-sm text-surface-500">{stat.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-surface-400 text-[14px]">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-brand-400 hover:text-brand-300 font-medium">
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-600/10 border border-red-600/30 rounded-lg text-[13px] text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" required
                  className="input-base pl-9 py-3"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="input-base pl-9 py-3"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required minLength={6}
                className="input-base pl-9 pr-10 py-3"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary py-3 justify-center text-[14px] font-semibold">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-[12px] text-surface-500">or</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          <button onClick={demoLogin} className="btn-secondary w-full justify-center py-3 text-[13px]">
            <Zap size={14} className="text-brand-400" /> Continue with Demo Account
          </button>

          <p className="text-[11px] text-surface-600 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
