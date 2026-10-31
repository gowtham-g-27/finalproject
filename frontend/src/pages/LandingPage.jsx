import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, QrCode, Award, ArrowRight, 
  Search, ShieldCheck, CheckCircle2, Building2, 
  Clock, MapPin, Compass, BellRing, BookOpen, Trophy, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function LandingPage() {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-14 pb-20">
      
      {/* Institutional Hero Banner */}
      <section className="bg-orange-50/60 border-b border-orange-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            
            {/* Campus notice pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white text-orange-800 border border-orange-200/80 shadow-2xs mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Spring 2026 University Event Directory • Activity Credit Eligible</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Campus Activities, Competitions & Academic Symposiums.
            </h1>

            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              Discover official student chapter workshops, inter-collegiate tournaments, technical hackathons, and cultural showcases. Register instantly with your student credentials and download verified participation certificates.
            </p>

            {/* In-hero Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by event title, symposium, topic, or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all shrink-0"
              >
                Find Events
              </button>
            </form>

            {/* Quick Action Badges */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Popular:</span>
              <Link to="/events?category=Technical" className="font-semibold text-slate-700 hover:text-orange-600 hover:underline">
                Hackathons & AI
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/events?category=Workshop" className="font-semibold text-slate-700 hover:text-orange-600 hover:underline">
                Hands-on Labs
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/events?category=Cultural" className="font-semibold text-slate-700 hover:text-orange-600 hover:underline">
                Vibrance Cultural Fest
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/events?category=Sports" className="font-semibold text-slate-700 hover:text-orange-600 hover:underline">
                Cricket League
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Campus Summary Numbers (Real collegiate metrics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Societies</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">28 Clubs</div>
            <div className="mt-1 text-[11px] text-slate-500">IEEE, ACM, Sports, Cultural</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Registrations</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-orange-600">1,240+ Seats</div>
            <div className="mt-1 text-[11px] text-slate-500">Enrolled for this semester</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gate Check-in</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-700">QR Digital Passes</div>
            <div className="mt-1 text-[11px] text-slate-500">Direct gate entrance verification</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accreditation</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700">Official Certificates</div>
            <div className="mt-1 text-[11px] text-slate-500">Verified institutional PDFs</div>
          </div>
        </div>
      </section>

      {/* Student Personal Recommendations (Explainable AI / Profile matches) */}
      {user && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-orange-50/40 rounded-3xl border border-orange-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  Recommended For You ({user.department})
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Tailored to your stated interests: {user.interests?.join(', ') || 'Campus Events'}
                </h2>
              </div>
              <Link to="/events" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0">
                Explore All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Upcoming Campus Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-orange-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upcoming Campus Events</h2>
            <p className="text-xs text-slate-500 mt-1">Review event agendas, verify eligibility, and secure your access pass</p>
          </div>
          <Link to="/events" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View Full Schedule <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-orange-50/50 rounded-2xl animate-pulse" />
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

      {/* Campus Engagement Workflow Overview (Real administrative architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Institutional Event Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
              Automated Campus Workflows From Proposal to Verification
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              NexEvent connects the entire campus workflow: student chapters propose events, administrative boards verify schedules, students receive digital QR passes, and verified attendees earn official activity certificates.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Fair Seating & Waitlists</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Atomic transactions prevent overselling. If a student cancels their registration, the next waitlisted candidate is automatically promoted.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Encrypted QR Check-In</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Unique ticket QR codes are verified at the entrance using any camera or scanner. Duplicate scans and unauthorized check-ins are rejected.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">ReportLab PDF Certificates</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Official certificates are instantly generated with verifiable hash codes, faculty signatures, and university seals for accredited activity credits.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
