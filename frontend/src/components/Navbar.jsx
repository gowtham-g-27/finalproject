import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, Calendar, Bell, Award, User, LogOut, 
  Menu, X, CheckCheck, ChevronDown, ShieldCheck, Briefcase, 
  UserCheck, Building2, Ticket, Compass, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar() {
  const { user, role, isStudent, isOrganizer, isAdmin, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
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
    <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-2xs">
      
      {/* Top Academic Sub-bar */}
      <div className="bg-orange-50/70 border-b border-orange-100/60 text-slate-600 text-[11px] py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              VIT-AP University • Directorate of Student Affairs
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-500 font-medium">
              Academic Term 2025–2026 Activity Portal
            </span>
          </div>

          {/* Quick Evaluator Role Switcher (Clear and collegiate) */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="hidden sm:inline font-medium text-[10px] text-slate-500 uppercase tracking-wider">
              Switch Role:
            </span>
            <div className="inline-flex rounded-lg bg-white border border-orange-200 p-0.5 text-[10px] shadow-2xs font-semibold">
              <button
                onClick={() => handleQuickLogin('student')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  isStudent ? 'bg-orange-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => handleQuickLogin('organizer')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  isOrganizer ? 'bg-orange-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organizer
              </button>
              <button
                onClick={() => handleQuickLogin('admin')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  isAdmin ? 'bg-orange-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Institutional Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm group-hover:bg-orange-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Nex<span className="text-orange-600">Event</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200/60">
                  Campus
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                College Event Management & Certification
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                isActive('/events')
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-orange-500" />
              Browse Events
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-4 h-4 text-orange-500" />
                My Access Passes
              </Link>
            )}

            {(isOrganizer || isAdmin) && (
              <Link
                to="/organizer"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  isActive('/organizer')
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-orange-500" />
                Organizer Studio
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                Administration
              </Link>
            )}

            <Link
              to="/certificates"
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                isActive('/certificates')
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-orange-500" />
              Certificates & Verification
            </Link>
          </nav>

          {/* Right Section: Notification Center & User Menu */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
                  aria-label="Notification Bulletin"
                  title="Campus Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
                      <div>
                        <div className="font-bold text-xs text-slate-900 uppercase tracking-wide">Campus Bulletin</div>
                        <div className="text-[10px] text-slate-500">Notifications & Event Alerts</div>
                      </div>
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
                        <div className="p-8 text-center text-xs text-slate-500">
                          No recent alerts or updates.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors ${
                              n.is_read ? 'bg-white opacity-85' : 'bg-orange-50/40 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-bold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {n.created_at?.slice(5, 10)}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Info / Auth Buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-orange-200/80 bg-orange-50/50 hover:bg-orange-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <span className="font-semibold text-orange-700 capitalize">{user.role}</span>
                      <span>•</span>
                      <span>{user.department || 'Campus'}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-orange-100 p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-orange-50 mb-1">
                      <div className="font-bold text-slate-900">{user.full_name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="text-[10px] text-orange-700 font-mono mt-0.5">
                        ID: {user.student_id || 'FAC-2026'}
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 font-medium"
                    >
                      <Ticket className="w-3.5 h-3.5 text-orange-500" />
                      My Registrations & Passes
                    </Link>

                    {(isOrganizer || isAdmin) && (
                      <Link
                        to="/organizer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 font-medium"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                        Organizer Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                        Admin Oversight Console
                      </Link>
                    )}

                    <Link
                      to="/certificates"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 font-medium"
                    >
                      <Award className="w-3.5 h-3.5 text-orange-500" />
                      My Certificates
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-2 rounded-xl text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all"
                >
                  Student Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-orange-50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 pt-2 pb-6 space-y-1 text-sm font-medium">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-orange-50"
          >
            <Compass className="w-4 h-4 text-orange-500" /> Browse Events
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-orange-50"
            >
              <Ticket className="w-4 h-4 text-orange-500" /> My Access Passes
            </Link>
          )}
          {(isOrganizer || isAdmin) && (
            <Link
              to="/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-orange-50"
            >
              <Briefcase className="w-4 h-4 text-orange-500" /> Organizer Studio
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-orange-50"
            >
              <ShieldCheck className="w-4 h-4 text-orange-500" /> Admin Console
            </Link>
          )}
          <Link
            to="/certificates"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-orange-50"
          >
            <Award className="w-4 h-4 text-orange-500" /> Certificates
          </Link>
        </div>
      )}
    </header>
  );
}
