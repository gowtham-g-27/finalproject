import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Calendar } from 'lucide-react';
import { api } from '../services/api';
import EventCard from '../components/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([
    'All', 'Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar', 'Competition'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery, sortBy, upcomingOnly]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        sort_by: sortBy,
        upcoming_only: upcomingOnly,
      };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const data = await api.getEvents(params);
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* 1. Header (Clean Minimalist Aesthetic) */}
      <div className="text-center space-y-2 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
          VIT-AP UNIVERSITY
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Campus Event Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Explore upcoming hackathons, guest seminars, varsity competitions, and cultural festivals.
        </p>
      </div>

      {/* 2. Search & Sort Controls (Clean Minimalist Bar) */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, speaker, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
          />
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs cursor-pointer"
          >
            <option value="date">Upcoming First</option>
            <option value="popularity">Most Popular</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>

          <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-2xs cursor-pointer">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="rounded text-slate-900 focus:ring-0"
            />
            <span>Upcoming Only</span>
          </label>
        </div>
      </div>

      {/* 3. Centered Category Filter Tabs (Exact Lezada Style from User Image 2) */}
      <div className="flex items-center justify-center gap-5 sm:gap-8 text-xs font-semibold tracking-wide overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`pb-1 transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'text-slate-900 font-black border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {cat === 'All' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* 4. Minimalist 3-Column Event Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or switching category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}

    </div>
  );
}
