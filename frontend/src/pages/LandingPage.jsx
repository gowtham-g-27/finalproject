import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Search, ShieldCheck, CheckCircle2, 
  Sparkles, Calendar, Award, Trophy, Laptop, Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function LandingPage() {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();

  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all approved/completed campus events for the home showcase
        const events = await api.getEvents();
        if (Array.isArray(events)) {
          setAllEvents(events);
          setDisplayedEvents(events);
        }

        if (user && isStudent) {
          try {
            const recs = await api.getRecommendations();
            if (Array.isArray(recs)) {
              setRecommendations(recs.slice(0, 3));
            }
          } catch (e) {
            console.warn("Recommendations skipped:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load landing data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isStudent]);

  const categories = [
    'All', 'Technical', 'Workshop', 'Cultural', 
    'Sports', 'Academic', 'Seminar', 'Competition', 'Other'
  ];

  // Handle Category Filter
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    filterEvents(category, searchQuery);
  };

  // Handle Search Input
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterEvents(activeCategory, query);
  };

  const filterEvents = (category, query) => {
    let filtered = [...allEvents];

    if (category !== 'All') {
      filtered = filtered.filter(
        (e) => (e.category || '').toLowerCase() === category.toLowerCase()
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.venue || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q)
      );
    }

    setDisplayedEvents(filtered);
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-20 pt-6">
      
      {/* 1. HERO BANNER (Exact Aesthetic from User Image 2 Lezada Hero) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#E8EEF5] border border-slate-200/60 p-8 sm:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
          
          {/* Subtle background text watermark */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl sm:text-9xl font-black text-slate-300/30 select-none pointer-events-none uppercase tracking-widest font-sans">
            eveReg
          </div>

          {/* Left Column: Minimalist Typography & Solid Dark Button */}
          <div className="max-w-md space-y-4 relative z-10 text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 block">
              VIT-AP CAMPUS ACTIVITIES
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Academic Events, Hackathons & Symposiums
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              Discover official student chapter workshops, inter-collegiate tournaments, and cultural showcases. Register instantly with your student credentials.
            </p>

            <div className="pt-3 flex items-center gap-3">
              <Link
                to="/events"
                className="inline-block px-7 py-3 rounded-none bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-xs"
              >
                Explore All Events
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 rounded-none border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors shadow-2xs"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Clean Visual Showcase */}
          <div className="relative z-10 w-full max-w-sm flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xs p-3 shadow-sm border border-white">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80"
                alt="Student Symposium"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] font-bold uppercase text-orange-600 block">Next Up</span>
                <span className="text-xs font-bold text-slate-900 block truncate">Annual Hackathon 2026</span>
                <span className="text-[10px] text-slate-500 font-mono">AB-1 Central Auditorium • Open</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CAMPUS EVENTS CATALOG WITH CATEGORY FILTER & SEARCH */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600 block">
              CAMPUS DIRECTORY • {displayedEvents.length} EVENTS AVAILABLE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Campus Events
            </h2>
            <p className="text-xs text-slate-500">
              Browse official university competitions, technical workshops, seminars, and sports meets.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campus events..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
            />
          </div>
        </div>

        {/* Minimalist Category Tabs */}
        <div className="flex flex-wrap items-center justify-start gap-2 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full transition-all text-xs ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
            <p className="font-semibold text-slate-600">No events found matching your filter.</p>
            <p className="mt-1">Try selecting another category or clearing your search.</p>
            <button
              onClick={() => { 
                setActiveCategory('All'); 
                setSearchQuery(''); 
                setDisplayedEvents(allEvents); 
              }}
              className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold hover:bg-orange-600"
            >
              Show All Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {displayedEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </section>

      {/* 3. STUDENT PERSONAL RECOMMENDATIONS (If Logged in) */}
      {user && recommendations.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-slate-100 pt-12">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600 block">
                TAILORED FOR YOU
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Recommended For {user.department || 'Your Department'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. SECONDARY FEATURED BANNER (Exact Lezada Showcase Banner from User Image 2) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#F8F9FA] border border-slate-200/80 p-8 sm:p-14 text-center space-y-5">
          
          {/* Visual Showcase Box */}
          <div className="max-w-xl mx-auto h-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
              alt="Symposium Hall"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/20" />
          </div>

          <div className="text-[11px] text-slate-400 font-mono tracking-widest pt-2">
            #spring2026 &nbsp; #symposium &nbsp; #accredited
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Official VIT-AP University Events. Caught in the moment!
            </h2>
            <p className="text-xs text-slate-500">
              Download verified PDF certificates, scan hardware-free QR entry passes, and track your co-curricular activity credits.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/events"
              className="inline-block px-7 py-3 rounded-none bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-xs"
            >
              Explore Full Catalog
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}