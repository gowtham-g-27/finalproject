import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Bell, Award, User, LogOut, Check,
  Layers, ShieldAlert, Sparkles, Menu, X, ChevronDown, CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar() {
  const { user, role, isStudent, isOrganizer, isAdmin, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close notifications dropdown
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
      // Ignore background errors
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
      setMobileMenuOpen(false);
      if (demoRole === 'admin') navigate('/admin');
      else if (demoRole === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Nex<span className="text-orange-600">Event</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                Campus Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/events')
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Browse Events
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Tickets
              </Link>
            )}

            {(isOrganizer || isAdmin) && (
              <Link
                to="/organizer"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/organizer')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Organizer Studio
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/admin')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Admin Console
              </Link>
            )}

            <Link
              to="/certificates"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/certificates')
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Certificates
            </Link>
          </nav>

          {/* Right Section: Quick Switcher / Notifications / User Menu */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Switcher Buttons */}
            <div className="hidden lg:flex items-center bg-orange-50 border border-orange-200/60 rounded-xl p-1 text-xs">
              <span className="px-2 text-slate-500 font-medium">Demo:</span>
              <button
                onClick={() => handleQuickLogin('student')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  isStudent ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => handleQuickLogin('organizer')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  isOrganizer ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organizer
              </button>
              <button
                onClick={() => handleQuickLogin('admin')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  isAdmin ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Notifications Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-orange-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden z-50 animate-slide-up">
                    <div className="flex items-center justify-between px-4 py-3 bg-orange-50/70 border-b border-orange-100">
                      <div className="font-bold text-sm text-slate-900">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors ${
                              n.is_read ? 'bg-white opacity-80' : 'bg-orange-50/30 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-bold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {n.created_at?.slice(0, 10)}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] font-semibold text-orange-600 uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-500/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-orange-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-orange-50"
          >
            Browse Events
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-orange-50"
            >
              My Tickets & Registrations
            </Link>
          )}
          {(isOrganizer || isAdmin) && (
            <Link
              to="/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-orange-50"
            >
              Organizer Studio
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-orange-50"
            >
              Admin Console
            </Link>
          )}
          <Link
            to="/certificates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-orange-50"
          >
            Certificates
          </Link>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => handleQuickLogin('student')}
              className="flex-1 py-1.5 text-xs font-semibold rounded bg-orange-100 text-orange-800"
            >
              Student Demo
            </button>
            <button
              onClick={() => handleQuickLogin('organizer')}
              className="flex-1 py-1.5 text-xs font-semibold rounded bg-orange-100 text-orange-800"
            >
              Organizer Demo
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex-1 py-1.5 text-xs font-semibold rounded bg-orange-100 text-orange-800"
            >
              Admin Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
