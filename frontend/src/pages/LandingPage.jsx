import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, QrCode, Award, ArrowRight, 
  Search, ShieldCheck, CheckCircle2, Building2, 
  Clock, MapPin, Compass, BellRing, BookOpen, Trophy, 
  Sparkles, ChevronDown, HelpCircle, Check, Star, ExternalLink,
  Laptop, Activity, Layers, UserCheck, Shield
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
  const [openFaq, setOpenFaq] = useState(0);

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

  const faqs = [
    {
      q: "How do I claim my participation certificate after attending an event?",
      a: "Once an event coordinator scans your Digital Gate Pass QR code during entrance, your attendance is immediately registered in the institutional ledger. You can download your official high-resolution PDF certificate with cryptographic verification hash directly from your Student Dashboard under 'Certificate Locker'."
    },
    {
      q: "What happens if a high-demand workshop reaches full capacity?",
      a: "eveReg operates an automated fair-queue waitlist. When maximum seating is reached, students are queued in the order they applied. If an enrolled student cancels their registration, the backend atomic transaction immediately promotes the next student in line and issues their confirmed digital pass."
    },
    {
      q: "Can registered student clubs and faculty propose events?",
      a: "Yes! Any authorized club coordinator or faculty advisor can use the Faculty & Organizer Studio to draft event schedules, upload banners, set capacity limits, and submit for Dean approval. Once approved by the Directorate of Student Welfare, the event is immediately published to the campus catalog."
    },
    {
      q: "Do gate volunteers need special scanner equipment for attendance?",
      a: "No proprietary hardware is required. The Organizer Dashboard includes an in-browser Live Camera Scanner compatible with smartphones, tablets, laptops, and USB barcode guns. It decodes passes in real-time, displays attendee identity, and prevents duplicate check-ins."
    },
    {
      q: "Are these event certificates recognized for academic activity credits?",
      a: "Yes. Every certificate generated through eveReg carries the official VIT-AP University seal, authorized faculty signature, and a unique certificate ID that can be independently audited via the public Certificate Verification portal."
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-24">
      
      {/* 1. HERO UNIT (Material UI Inspiration: Modern Elevation + Dual CTA + Live Mockup) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/80 via-orange-50/30 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-orange-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading, Subtitle & Search */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Campus Semester Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-orange-900 border border-orange-200/90 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Spring 2026 Academic Term • Official Student Welfare Portal</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Campus Activities, Hackathons &{' '}
                <span className="text-orange-600 underline decoration-orange-300 decoration-wavy decoration-2">
                  Symposiums
                </span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                The central campus platform for VIT-AP University students, club organizers, and academic administrators. Register for workshops, scan digital entry passes, and earn verified activity certificates.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/events"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Explore Event Catalog
                </Link>
                <Link
                  to="/organizer"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-orange-50 border border-orange-200 shadow-2xs transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-orange-600" />
                  Organizer Studio
                </Link>
              </div>

              {/* In-hero Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by symposium title, topic, club, or venue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-28 py-3.5 rounded-2xl border border-orange-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-2xs transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Quick Filters:</span>
                <Link to="/events?category=Technical" className="px-2.5 py-1 rounded-lg bg-white border border-orange-100 hover:border-orange-300 text-slate-700 font-medium">
                  Technical
                </Link>
                <Link to="/events?category=Workshop" className="px-2.5 py-1 rounded-lg bg-white border border-orange-100 hover:border-orange-300 text-slate-700 font-medium">
                  Workshops
                </Link>
                <Link to="/events?category=Cultural" className="px-2.5 py-1 rounded-lg bg-white border border-orange-100 hover:border-orange-300 text-slate-700 font-medium">
                  Cultural Fest
                </Link>
                <Link to="/events?category=Sports" className="px-2.5 py-1 rounded-lg bg-white border border-orange-100 hover:border-orange-300 text-slate-700 font-medium">
                  Sports
                </Link>
              </div>

            </div>

            {/* Right Column: Collegiate Portal Mockup Preview (MUI Card Styling) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Background decorative glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-400 to-amber-300 opacity-20 blur-xl" />

                {/* Main Card */}
                <div className="relative bg-white rounded-3xl border border-orange-200/90 shadow-xl p-6 space-y-5 text-slate-900">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-orange-800">
                          VIT-AP Student Pass
                        </div>
                        <div className="text-sm font-extrabold text-slate-900">
                          Annual Hackathon 2026
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Confirmed Entry
                    </span>
                  </div>

                  {/* Interactive Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Venue</span>
                      <strong className="text-slate-800">APJ Block, Hall 1</strong>
                    </div>
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Schedule</span>
                      <strong className="text-slate-800">Tomorrow • 10:00 AM</strong>
                    </div>
                  </div>

                  {/* Pass Security Bar */}
                  <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono">TKT-HACK-8B42</div>
                        <div className="text-xs font-bold text-slate-100">Camera Scan Ready</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  {/* Feature Checklist inside card */}
                  <div className="pt-2 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant attendance verification at venue entrance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automated verifiable PDF Certificate issuance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Academic activity credit tracking</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CAMPUS SOCIETIES MARQUEE (Collegiate Organizations) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Official Chapters & Student Bodies Operating On eveReg
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 font-semibold text-xs sm:text-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-2xs">
            <Trophy className="w-4 h-4 text-orange-600" />
            <span>IEEE Student Branch</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-2xs">
            <Laptop className="w-4 h-4 text-orange-600" />
            <span>ACM Chapter VIT-AP</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-2xs">
            <Activity className="w-4 h-4 text-orange-600" />
            <span>GDSC Innovation Lab</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-2xs">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Arts & Cultural Board</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-2xs">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>University Sports Council</span>
          </div>
        </div>
      </section>

      {/* 3. CAMPUS METRIC COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campus Societies</div>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">28+</div>
            <div className="mt-1 text-xs text-slate-500">IEEE, ACM, Robotics & Sports</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Registrations</div>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-orange-600">1,240+</div>
            <div className="mt-1 text-xs text-slate-500">Enrolled for this semester</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gate Check-in</div>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">Live Camera</div>
            <div className="mt-1 text-xs text-slate-500">Hardware-free QR verification</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accreditation</div>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-700">100% PDF</div>
            <div className="mt-1 text-xs text-slate-500">Cryptographically verifiable</div>
          </div>
        </div>
      </section>

      {/* 4. STUDENT PERSONAL RECOMMENDATIONS */}
      {user && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-orange-50/50 rounded-3xl border border-orange-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  Recommended For You ({user.department || 'VIT-AP'})
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

      {/* 5. FEATURED UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-orange-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Campus Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review event agendas, verify eligibility, and secure your access pass
            </p>
          </div>
          <Link to="/events" className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View Full Schedule <ArrowRight className="w-4 h-4" />
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

      {/* 6. ONE PLATFORM, THREE CAMPUS ROLES (MUI Templates Pricing/Role Breakdown Pattern) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
            Role-Based Campus Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Engineered For Every University Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Seamlessly integrated permissions guarantee security, transparency, and audit readiness across the entire university.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Student */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Enrolled Student</h3>
                <p className="text-xs text-slate-500 mt-1">Discover activities and build your collegiate co-curricular portfolio.</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-orange-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1-Click Event Enrollment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Encrypted QR Gate Passes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fair Waitlist Seat Allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verifiable PDF Certificates</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/dashboard"
                className="w-full py-2.5 rounded-xl font-bold text-xs text-center block bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 transition-colors"
              >
                Go to Student Portal
              </Link>
            </div>
          </div>

          {/* Card 2: Organizer (Highlighted) */}
          <div className="bg-orange-50/70 rounded-3xl p-6 sm:p-8 border-2 border-orange-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs">
              Coordinator Studio
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Faculty & Club Organizer</h3>
                <p className="text-xs text-slate-600 mt-1">Propose symposiums, manage seat rosters, and scan gate passes.</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-orange-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Proposal Submission & AI Assistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Live Camera QR Code Scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Roster Management & CSV Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Event Edit & Capacity Controls</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/organizer"
                className="w-full py-2.5 rounded-xl font-bold text-xs text-center block bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
              >
                Open Organizer Studio
              </Link>
            </div>
          </div>

          {/* Card 3: Administrator */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">University Administrator</h3>
                <p className="text-xs text-slate-500 mt-1">Directorate of Student Welfare console for audit, reviews & analytics.</p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-orange-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Event Approval & Rejection Workflow</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>User RBAC & Role Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Institutional Compliance Audit Log</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Recharts Cross-Campus Analytics</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/admin"
                className="w-full py-2.5 rounded-xl font-bold text-xs text-center block bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 transition-colors"
              >
                Access Board Console
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (MUI Accordion Pattern) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
            Common Student & Faculty Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything you need to know about campus registrations, ticketing, waitlists, and accreditation.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-orange-600 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-orange-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-orange-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. HIGH-IMPACT CAMPUS CALL TO ACTION (MUI Bottom Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 relative overflow-hidden shadow-lg">
          
          {/* Subtle background radial glow */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Spring 2026 Registration Open
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Ready to participate in upcoming campus events?
            </h2>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Log in with your official VIT-AP university credentials to reserve seats, track your co-curricular attendance, and build your accredited activity portfolio.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all flex items-center gap-2"
              >
                Browse All Events <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/certificates"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2"
              >
                Verify a Certificate <Shield className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
