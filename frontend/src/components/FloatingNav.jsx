import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, LogOut, ChevronDown, User, CheckCheck, 
  Sparkles, ShieldCheck, Ticket, Building2, Calendar, Home, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function FloatingNav() {
  const { user, role, isStudent, isOrganizer, isAdmin, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const roleMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
      setRoleMenuOpen(false);
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

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Floating Pill Nav Bar Container (Exact Match to User Reference Image 1) */}
        <nav className="pointer-events-auto mx-auto w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-full border border-slate-200/90 shadow-md shadow-slate-900/5 px-3 py-2 flex items-center justify-between gap-2 sm:gap-4 transition-all">
          
          {/* Brand Logo: vitap eveReg */}
          <Link to="/" className="flex items-center gap-2 pl-2 shrink-0 group">
            <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white font-black text-[11px] tracking-tight shadow-2xs">
              vitap
            </span>
            <span className="text-sm font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
              eve<span className="text-orange-600">Reg</span>
            </span>
          </Link>

          {/* Center Links (Home, Events, Role Dashboard, Verify) */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold text-slate-600">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-full transition-all ${
                isActive('/') && location.pathname === '/'
                  ? 'text-slate-900 font-bold bg-slate-100'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/events"
              className={`px-3 py-1.5 rounded-full transition-all ${
                isActive('/events')
                  ? 'text-slate-900 font-bold bg-slate-100'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Events
            </Link>

            {/* Dedicated Role Link */}
            {isStudent && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/dashboard')
                    ? 'text-slate-900 font-bold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Passes
              </Link>
            )}

            {isOrganizer && (
              <Link
                to="/organizer"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/organizer')
                    ? 'text-slate-900 font-bold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Studio
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/admin')
                    ? 'text-slate-900 font-bold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Console
              </Link>
            )}

            <Link
              to="/certificates"
              className={`hidden md:inline-block px-3 py-1.5 rounded-full transition-all ${
                isActive('/certificates')
                  ? 'text-slate-900 font-bold bg-slate-100'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Verify
            </Link>
          </div>

          {/* Right Action: Login / Profile Pill Button (Exact Match to User Reference Image 1) */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Notifications Icon (when logged in) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors relative"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-600" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">Campus Notices</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="py-2.5">
                            <div className="font-bold text-slate-800 text-xs">{n.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{n.created_at?.slice(0, 10)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Authenticated: Profile Pill with Role Selector */}
            {user ? (
              <div className="relative" ref={roleMenuRef}>
                <button
                  type="button"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-900 shadow-2xs transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] uppercase font-bold">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                  <span className="hidden sm:inline font-semibold text-xs truncate max-w-[100px]">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
                    {user.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Role Switcher & Profile Dropdown */}
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1">
                    <div className="p-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{user.full_name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    </div>

                    <div className="p-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        1-Click Switch Role
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('student')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-semibold ${
                          isStudent ? 'bg-orange-50 text-orange-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>Student</span>
                        {isStudent && <span className="text-[10px] font-bold">Active</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('organizer')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-semibold ${
                          isOrganizer ? 'bg-orange-50 text-orange-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>Organizer</span>
                        {isOrganizer && <span className="text-[10px] font-bold">Active</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('admin')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-semibold ${
                          isAdmin ? 'bg-orange-50 text-orange-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>Admin</span>
                        {isAdmin && <span className="text-[10px] font-bold">Active</span>}
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* User Reference Image 1 Exact Pill: Login Button */
              <div className="relative" ref={roleMenuRef}>
                <button
                  type="button"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="px-5 py-1.5 rounded-full border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-900 shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span>Login</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Quick login / role select for guest */}
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1">
                    <Link
                      to="/login"
                      onClick={() => setRoleMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-center font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-2xs"
                    >
                      Campus Sign In
                    </Link>
                    <div className="py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Quick Demo Role Access
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('student')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-orange-50 font-semibold"
                    >
                      Log in as Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('organizer')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-orange-50 font-semibold"
                    >
                      Log in as Organizer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-orange-50 font-semibold"
                    >
                      Log in as Admin
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </nav>

      </div>
    </header>
  );
}
