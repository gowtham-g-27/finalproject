import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please provide both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.full_name}!`, 'success');
      
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-2xs">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[11px] tracking-tight">
              vitap
            </span>
            <span className="text-xl font-normal tracking-tight text-slate-900">
              eve<span className="text-orange-600 font-semibold">Reg</span>
            </span>
          </div>
          <h2 className="text-2xl font-normal text-slate-900 tracking-tight">
            Account Sign In
          </h2>
          <p className="text-xs text-slate-400">
            VIT-AP University Student, Faculty & Board Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest text-white bg-slate-900 hover:bg-orange-600 transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-slate-900 hover:text-orange-600 underline">
            Register as Student or Organiser
          </Link>
        </div>

      </div>
    </div>
  );
}

