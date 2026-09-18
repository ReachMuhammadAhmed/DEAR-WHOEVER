import React, { useState, useMemo } from 'react';
import { Search, Filter, Mail, Send, Heart, Grid3x3, Sparkles } from 'lucide-react';
import { Postcard } from '../types';
import { PostcardCard } from './PostcardCard';

interface PostcardWallProps {
  postcards: Postcard[];
  onSelectPostcard: (postcard: Postcard) => void;
  onLike: (id: string) => void;
}

type FilterTab = 'all' | 'received' | 'sent' | 'popular';

export const PostcardWall: React.FC<PostcardWallProps> = ({
  postcards,
  onSelectPostcard,
  onLike,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPostcards = useMemo(() => {
    return postcards
      .filter((pc) => {
        // Filter by tab
        if (activeTab === 'received' && !pc.isUserReceived) return false;
        if (activeTab === 'sent' && !pc.isUserSent) return false;
        if (activeTab === 'popular' && (pc.likes || 0) < 10) return false;

        // Filter by search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = pc.title.toLowerCase().includes(q);
          const matchSender = pc.sender.toLowerCase().includes(q);
          const matchLocation = pc.location.toLowerCase().includes(q);
          const matchMsg = pc.message.toLowerCase().includes(q);
          const matchSource =
            pc.isFromPreviousStranger &&
            ('previous stranger'.includes(q) || 'archive'.includes(q));
          return matchTitle || matchSender || matchLocation || matchMsg || matchSource;
        }

        return true;
      })
      .slice(0, 100); // Strict limit to last 100
  }, [postcards, activeTab, searchQuery]);

  const receivedCount = postcards.filter((p) => p.isUserReceived).length;
  const sentCount = postcards.filter((p) => p.isUserSent).length;

  return (
    <section id="postcard-wall-section" className="flex flex-col gap-5">
      {/* Wall Header & Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              The Living Postcard Wall
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-mono-stamp font-bold tracking-wider uppercase">
              {Math.min(postcards.length, 100)} / 100 ARTWORKS
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono-stamp mt-0.5">
            A communal gallery of tiny 32×32 pixel postcards mailed between strangers worldwide.
          </p>
        </div>

        {/* Search Bar & Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="wall-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, city, sender..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white text-stone-800 placeholder-stone-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-md border border-stone-200 text-xs">
            <button
              id="tab-all-postcards"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 border border-stone-300 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({postcards.length})
            </button>

            <button
              id="tab-received-postcards"
              type="button"
              onClick={() => setActiveTab('received')}
              className={`px-3 py-1 rounded-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-white text-stone-900 border border-stone-300 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3 h-3 text-indigo-500" />
              <span>Received ({receivedCount})</span>
            </button>

            <button
              id="tab-sent-postcards"
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`px-3 py-1 rounded-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-white text-stone-900 border border-stone-300 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Send className="w-3 h-3 text-amber-600" />
              <span>Sent ({sentCount})</span>
            </button>

            <button
              id="tab-popular-postcards"
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1 rounded-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-white text-stone-900 border border-stone-300 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Heart className="w-3 h-3 text-rose-500" />
              <span>Top Loved</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wall Postcard Grid */}
      {filteredPostcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-stone-300 text-center">
          <div className="w-12 h-12 rounded-md bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">No postcards found</h3>
          <p className="text-xs text-stone-500 font-mono-stamp mt-1 max-w-sm">
            {searchQuery
              ? `No postcards match "${searchQuery}". Try a different keyword.`
              : activeTab === 'sent'
              ? 'You haven’t mailed any pixel postcards yet! Draw something above and mail your first creation.'
              : 'The mailbox is quiet right now. Mail a postcard to receive one back!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredPostcards.map((pc) => (
            <PostcardCard
              key={pc.id}
              postcard={pc}
              isCompact={true}
              onClick={() => onSelectPostcard(pc)}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </section>
  );
};
