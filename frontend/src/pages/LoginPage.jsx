import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck, Shield, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanIdent = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanIdent || !cleanPass) {
      addToast('Please provide both College ID / Email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await login(cleanIdent, cleanPass);
      addToast(`Welcome back, ${user.full_name}!`, 'success');
      
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuick = (idOrEmail, pass) => {
    setIdentifier(idOrEmail);
    setPassword(pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-2xs">
        
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
              College ID or Campus Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="24MIS1001 or gowtham@campus.edu"
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
            {loading ? 'Verifying...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Fill Helpers for Testing */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Quick Fill Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillQuick('24MIS1001', 'student123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200 text-center transition-colors truncate"
              title="Geetha Gowtham (24MIS1001 / student123)"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillQuick('24MIS7001', 'organizer123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200 text-center transition-colors truncate"
              title="Vyshnavi (24MIS7001 / organizer123)"
            >
              📋 Coordinator
            </button>
            <button
              type="button"
              onClick={() => fillQuick('24MIS9001', 'admin123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200 text-center transition-colors truncate"
              title="Dr. Venkatramana (24MIS9001 / admin123)"
            >
              🏛️ Admin
            </button>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center text-xs text-slate-400 pt-1">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-slate-900 hover:text-orange-600 underline">
            Register as Student or Organiser
          </Link>
        </div>

      </div>
    </div>
  );
}