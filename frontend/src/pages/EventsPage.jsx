import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Tag, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import EventCard from '../components/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([
    'All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar', 'Competition'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Campus Events
        </h1>
        <p className="mt-2 text-slate-600 text-sm">
          Discover competitions, cultural performances, tech workshops, and guest lectures.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-orange-50/50 p-4 sm:p-6 rounded-2xl border border-orange-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event title, speaker, tags, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-xl border border-orange-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs appearance-none cursor-pointer"
              >
                <option value="date">Sort: Upcoming First</option>
                <option value="popularity">Sort: Most Popular</option>
                <option value="title">Sort: Alphabetical (A-Z)</option>
              </select>
              <ArrowUpDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Upcoming checkbox */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-3 py-2.5 rounded-xl border border-orange-200 shadow-xs whitespace-nowrap">
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(e) => setUpcomingOnly(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              Future Events Only
            </label>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-orange-200/80 hover:bg-orange-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-orange-50/50 animate-pulse border border-orange-100" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-orange-50/30 rounded-3xl border border-dashed border-orange-200">
          <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No events found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or checking back soon for new announcements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

