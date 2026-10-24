import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, UserCheck, ShieldCheck, Briefcase } from 'lucide-react';
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

  const handleDemoFill = (role) => {
    const demos = {
      student: { email: 'student@campus.edu', pass: 'student123' },
      organizer: { email: 'organizer@campus.edu', pass: 'organizer123' },
      admin: { email: 'admin@campus.edu', pass: 'admin123' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-orange-100 shadow-xl shadow-orange-500/5">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 mx-auto flex items-center justify-center text-white shadow-md shadow-orange-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Log in to NexEvent
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access your registrations, organize events, or manage platform approvals
          </p>
        </div>

        {/* Demo Quick-Fill Bar (Crucial for viva demonstration) */}
        <div className="p-3 bg-orange-50/70 rounded-2xl border border-orange-200/70">
          <div className="text-[11px] font-bold text-orange-950 uppercase tracking-wider text-center mb-2">
            One-Click Demo Credentials
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:text-orange-600 hover:border-orange-300 border border-orange-100 transition-colors shadow-2xs flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-500" /> Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('organizer')}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:text-orange-600 hover:border-orange-300 border border-orange-100 transition-colors shadow-2xs flex items-center justify-center gap-1"
            >
              <Briefcase className="w-3.5 h-3.5 text-orange-500" /> Organizer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:text-orange-600 hover:border-orange-300 border border-orange-100 transition-colors shadow-2xs flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-orange-100">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-orange-600 hover:underline">
            Register as a Student or Organizer
          </Link>
        </div>

      </div>
    </div>
  );
}
