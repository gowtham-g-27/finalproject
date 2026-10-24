import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Calendar, Users, QrCode, Award, ArrowRight, 
  Search, ShieldCheck, CheckCircle2, TrendingUp 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function LandingPage() {
  const { user, isStudent } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const events = await api.getEvents({ upcoming_only: true });
        setFeaturedEvents(events.slice(0, 3));

        if (user && isStudent) {
          const recs = await api.getRecommendations();
          setRecommendations(recs.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load landing data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isStudent]);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-white to-white pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-orange-100 text-orange-800 border border-orange-200 shadow-xs mb-8">
            <Sparkles className="w-4 h-4 text-orange-600" />
            OFFICIAL UNIVERSITY EVENT & ENGAGEMENT HUB
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Experience Campus Life. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
              Discover, Register & Connect.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            The smart all-in-one ecosystem for hackathons, cultural festivals, sports tournaments, and workshops. Instant QR ticketing, automated waitlists, and verified certificates.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/25 transition-all text-base active:scale-[0.98]"
            >
              Explore Events <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-orange-50 border border-orange-200 transition-all text-base shadow-xs"
            >
              Join Campus Hub
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="text-3xl font-extrabold text-orange-600">100%</div>
              <div className="text-xs font-medium text-slate-600 mt-1">Live Registration Logic</div>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="text-3xl font-extrabold text-orange-600">Real-time</div>
              <div className="text-xs font-medium text-slate-600 mt-1">QR Code Check-ins</div>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="text-3xl font-extrabold text-orange-600">Automated</div>
              <div className="text-xs font-medium text-slate-600 mt-1">Waitlist Promotions</div>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="text-3xl font-extrabold text-orange-600">Verified</div>
              <div className="text-xs font-medium text-slate-600 mt-1">PDF Certificates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations if student logged in */}
      {user && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Recommended For You
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Matched to Your Interests ({user.interests?.join(', ') || 'Campus Highlights'})
              </h2>
            </div>
            <Link to="/events" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Campus Events</h2>
            <p className="text-sm text-slate-600 mt-1">Register now before seats and waitlists fill up</p>
          </div>
          <Link to="/events" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            See all events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-orange-50/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 p-8 sm:p-12 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Engineered for Real Campus Operations
            </h2>
            <p className="mt-4 text-orange-100 text-sm sm:text-base leading-relaxed">
              Every feature is built with end-to-end security, data persistence, and verified workflows.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <QrCode className="w-8 h-8 text-orange-200 mb-4" />
              <h3 className="font-bold text-lg">Instant QR Check-ins</h3>
              <p className="text-xs text-orange-100 mt-2">
                Camera-driven QR scanner verifies tickets, prevents double scans, and restricts check-in to designated organizers.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-orange-200 mb-4" />
              <h3 className="font-bold text-lg">Waitlist Automation</h3>
              <p className="text-xs text-orange-100 mt-2">
                When seats are full, students are queued. If an attendee cancels, the system automatically promotes the next student in line.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Award className="w-8 h-8 text-orange-200 mb-4" />
              <h3 className="font-bold text-lg">Official PDF Certificates</h3>
              <p className="text-xs text-orange-100 mt-2">
                Upon verified attendance, dynamically rendered tamper-resistant PDF certificates are generated with unique IDs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
