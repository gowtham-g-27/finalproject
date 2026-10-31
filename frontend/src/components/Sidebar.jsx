import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Award, LogOut, Menu, X, Bell, ShieldCheck, 
  Building2, Ticket, Home, ChevronRight, User, CheckCheck,
  GraduationCap, Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Sidebar() {
  const { user, role, isStudent, isOrganizer, isAdmin, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Periodic notification polling when authenticated
  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener for notifications popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      // background fetch fail-safe
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickLogin = async (demoRole) => {
    const creds = {
      student: { email: 'student@campus.edu', pass: 'student123' },
      organizer: { email: 'organizer@campus.edu', pass: 'organizer123' },
      admin: { email: 'admin@campus.edu', pass: 'admin123' }
    };
    try {
      await login(creds[demoRole].email, creds[demoRole].pass);
      setMobileOpen(false);
      if (demoRole === 'admin') navigate('/admin');
      else if (demoRole === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Campus Home', path: '/', icon: Home },
    { label: 'Event Catalog', path: '/events', icon: Calendar },
    { label: 'Student Passes', path: '/dashboard', icon: Ticket, roles: ['student', 'organizer', 'admin'] },
    { label: 'Organizer Studio', path: '/organizer', icon: Building2, roles: ['organizer', 'admin'] },
    { label: 'Board Console', path: '/admin', icon: ShieldCheck, roles: ['admin'] },
    { label: 'Verify Certificate', path: '/certificates', icon: Award },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-orange-100 select-none">
      
      {/* 1. CLEAN LOGO & BRAND HEADER */}
      <div className="p-5 border-b border-orange-100/80">
        <Link to="/" className="flex items-center gap-2.5 group">
          {/* vitap Logo Badge */}
          <div className="px-2.5 py-1 rounded-xl bg-orange-600 text-white font-black text-xs tracking-tight shadow-xs flex items-center justify-center">
            vitap
          </div>
          
          {/* eveReg Name */}
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
              eve<span className="text-orange-600">Reg</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
              Campus Events Portal
            </span>
          </div>
        </Link>

        {/* Institutional subtext */}
        <div className="mt-3.5 pt-2.5 border-t border-orange-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>VIT-AP University</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            Term 2026
          </span>
        </div>
      </div>

      {/* 2. ONE-CLICK EVALUATOR ROLE SWITCHER (Collegiate & Seamless for Viva) */}
      <div className="p-4 border-b border-orange-100/60 bg-orange-50/30">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>Switch Demo Role</span>
          <span className="text-orange-600 font-mono text-[9px]">1-Click</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-orange-200/80 shadow-2xs text-[11px] font-bold text-center">
          <button
            type="button"
            onClick={() => handleQuickLogin('student')}
            className={`py-1.5 rounded-lg transition-colors ${
              isStudent ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('organizer')}
            className={`py-1.5 rounded-lg transition-colors ${
              isOrganizer ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50'
            }`}
          >
            Organizer
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className={`py-1.5 rounded-lg transition-colors ${
              isAdmin ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* 3. NAVIGATION ITEMS */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-orange-50/70 hover:text-orange-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-orange-600'}`} />
                <span>{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </Link>
          );
        })}

        {/* Notifications Trigger Link */}
        {user && (
          <div className="pt-2 relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50/70 hover:text-orange-950 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-orange-600" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-600 text-white shadow-2xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute left-full ml-2 bottom-0 w-80 bg-white rounded-2xl shadow-xl border border-orange-200 z-50 overflow-hidden text-xs">
                <div className="p-3.5 bg-orange-50/60 border-b border-orange-100 flex items-center justify-between">
                  <div className="font-bold text-slate-900">Campus Bulletins</div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-orange-700 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-orange-50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 transition-colors ${
                          n.is_read ? 'bg-white text-slate-600' : 'bg-orange-50/40 text-slate-900 font-medium'
                        }`}
                      >
                        <div className="font-bold text-xs">{n.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {n.created_at?.slice(0, 10)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. USER PROFILE & LOGOUT FOOTER */}
      <div className="p-3 border-t border-orange-100 bg-orange-50/30">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-orange-100 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-bold text-xs uppercase flex items-center justify-center shrink-0">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-orange-700 font-semibold uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Link
              to="/login"
              className="w-full py-2 px-3 rounded-xl text-center text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 block transition-colors shadow-2xs"
            >
              Campus Sign In
            </Link>
            <Link
              to="/signup"
              className="w-full py-2 px-3 rounded-xl text-center text-xs font-semibold text-slate-700 bg-white hover:bg-orange-50 border border-orange-200 block transition-colors"
            >
              Register Student ID
            </Link>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* A. DESKTOP PERSISTENT SIDEBAR (Visible on lg screens) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* B. MOBILE TOPBAR (Visible on < lg screens) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-orange-100 px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link to="/" className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-lg bg-orange-600 text-white font-black text-xs tracking-tight shadow-2xs">
            vitap
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            eve<span className="text-orange-600">Reg</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick role switch badge on mobile */}
          <button
            type="button"
            onClick={() => handleQuickLogin(isStudent ? 'organizer' : isOrganizer ? 'admin' : 'student')}
            className="px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-bold uppercase"
          >
            Role: {role || 'Guest'}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-orange-200 bg-white text-slate-700 hover:bg-orange-50"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-orange-600" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* C. MOBILE OFF-CANVAS DRAWER */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
