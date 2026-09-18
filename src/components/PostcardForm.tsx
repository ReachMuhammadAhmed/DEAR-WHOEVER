import React, { useMemo } from 'react';
import {
  Send,
  Dices,
  Stamp as StampIcon,
  MessageSquare,
  User,
  MapPin,
  Type,
  Eye,
  Trash2,
} from 'lucide-react';
import { StampType } from '../types';
import { StampBadge } from './StampBadge';
import { PixelArtDisplay } from './PixelArtDisplay';
import { DEFAULT_BG_COLOR } from '../utils/pixelUtils';

interface PostcardFormProps {
  title: string;
  setTitle: (t: string) => void;
  message: string;
  setMessage: (m: string) => void;
  sender: string;
  setSender: (s: string) => void;
  location: string;
  setLocation: (l: string) => void;
  stampType: StampType;
  setStampType: (st: StampType) => void;
  stampColor: string;
  setStampColor: (sc: string) => void;
  onMail: () => void;
  isMailing?: boolean;
  pixels?: string[];
  onClearArt?: () => void;
}

const RANDOM_SENDERS = [
  'A Friendly Stranger',
  'Tea Drinker',
  'Cloud Watcher',
  'Night Owl',
  'Pocket Poet',
  'Coffee Enthusiast',
  'Window Seat Rider',
  'Pixel Dreamer',
  'Bookworm',
  'Rainy Day Stroller',
];

const RANDOM_LOCATIONS = [
  'Tokyo, Japan',
  'Reykjavik, Iceland',
  'Kyoto, Japan',
  'Portland, USA',
  'Amsterdam, Netherlands',
  'Edinburgh, Scotland',
  'Melbourne, Australia',
  'Lisbon, Portugal',
  'Seoul, South Korea',
  'Valparaíso, Chile',
];

const STAMP_CHOICES: { type: StampType; label: string }[] = [
  { type: 'sun', label: 'Sun' },
  { type: 'mountain', label: 'Peak' },
  { type: 'cat', label: 'Cat' },
  { type: 'coffee', label: 'Coffee' },
  { type: 'botanical', label: 'Leaf' },
  { type: 'star', label: 'Star' },
  { type: 'cloud', label: 'Cloud' },
  { type: 'heart', label: 'Heart' },
  { type: 'lighthouse', label: 'Beacon' },
];

const STAMP_COLORS = [
  '#DC2626', // Red
  '#EA580C', // Orange
  '#D97706', // Amber
  '#059669', // Emerald
  '#0284C7', // Sky
  '#4F46E5', // Indigo
  '#9333EA', // Violet
  '#EC4899', // Pink
  '#1C1917', // Black ink
];

export const PostcardForm: React.FC<PostcardFormProps> = ({
  title,
  setTitle,
  message,
  setMessage,
  sender,
  setSender,
  location,
  setLocation,
  stampType,
  setStampType,
  stampColor,
  setStampColor,
  onMail,
  isMailing = false,
  pixels = [],
  onClearArt,
}) => {
  const randomizeSender = () => {
    const randomName = RANDOM_SENDERS[Math.floor(Math.random() * RANDOM_SENDERS.length)];
    setSender(randomName);
  };

  const randomizeLocation = () => {
    const randomLoc = RANDOM_LOCATIONS[Math.floor(Math.random() * RANDOM_LOCATIONS.length)];
    setLocation(randomLoc);
  };

  // Count non-background pixels to show live painting status
  const paintedPixelsCount = useMemo(() => {
    if (!pixels || pixels.length === 0) return 0;
    return pixels.filter((c) => c && c.toLowerCase() !== DEFAULT_BG_COLOR.toLowerCase()).length;
  }, [pixels]);

  return (
    <div id="postcard-form-container" className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
          <StampIcon className="w-4 h-4 text-amber-600" /> Postcard Details
        </h3>
        <span className="text-xs font-mono-stamp text-stone-400">Step 2 of 2</span>
      </div>

      {/* Postcard Art Review / Live Preview */}
      <div
        id="postcard-art-review"
        className="p-3 bg-stone-50/80 rounded-lg border border-stone-200 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono-stamp flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-600" /> Art Review
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-stamp text-stone-500">
              {paintedPixelsCount > 0 ? `${paintedPixelsCount} px painted` : 'Canvas blank'}
            </span>
            {onClearArt && paintedPixelsCount > 0 && (
              <button
                id="btn-review-clear-art"
                type="button"
                onClick={onClearArt}
                title="Clear artwork & reset canvas"
                className="text-[11px] text-rose-600 hover:text-rose-700 font-mono-stamp flex items-center gap-0.5 cursor-pointer hover:underline"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Miniature Live Postcard Preview */}
        <div className="flex items-center gap-3 p-2 bg-white rounded-md border border-stone-200">
          {/* Miniature 32x32 Art Canvas */}
          <div className="w-16 h-16 rounded-xs border border-stone-300 bg-[#FDFBF7] overflow-hidden shrink-0 flex items-center justify-center">
            {pixels.length === 1024 ? (
              <PixelArtDisplay pixels={pixels} className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[#FDFBF7]" />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between h-16 py-0.5">
            <div>
              <span className="text-xs font-bold text-stone-900 truncate block">
                {title.trim() || 'Untitled Postcard'}
              </span>
              <span className="text-[11px] text-stone-500 font-mono-stamp truncate block">
                by {sender.trim() || 'Anonymous Artist'} • {location.trim() || 'Unknown City'}
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-mono-stamp text-stone-400">
                Front Art • 32×32 px
              </span>
              <div className="transform scale-90 origin-right">
                <StampBadge type={stampType} color={stampColor} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Postcard Title */}
      <div>
        <label htmlFor="postcard-title" className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-stone-400" /> Postcard Title
        </label>
        <input
          id="postcard-title"
          type="text"
          maxLength={36}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Tiny Golden Sunrise"
          className="w-full text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
        />
      </div>

      {/* Message on the Back */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="postcard-message" className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" /> Note for the Stranger
          </label>
          <span className="text-[10px] font-mono-stamp text-stone-400">
            {message.length}/120
          </span>
        </div>
        <textarea
          id="postcard-message"
          rows={3}
          maxLength={120}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a warm thought, a wish, or where you drew this..."
          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors resize-none italic font-serif"
        />
      </div>

      {/* Sender & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sender Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="postcard-sender" className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" /> Sender Pseudonym
            </label>
            <button
              type="button"
              onClick={randomizeSender}
              className="text-[10px] text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
              title="Pick random name"
            >
              <Dices className="w-3 h-3" /> Random
            </button>
          </div>
          <input
            id="postcard-sender"
            type="text"
            maxLength={28}
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="e.g. Tea Drinker"
            className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="postcard-location" className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" /> Postmark Location
            </label>
            <button
              type="button"
              onClick={randomizeLocation}
              className="text-[10px] text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
              title="Pick random city"
            >
              <Dices className="w-3 h-3" /> Random
            </button>
          </div>
          <input
            id="postcard-location"
            type="text"
            maxLength={28}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kyoto, Japan"
            className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Choice of Stamp */}
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">
          Select Your Postage Stamp
        </label>
        {/* Stamp type icons */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 mb-2.5">
          {STAMP_CHOICES.map(({ type, label }) => {
            const isSelected = stampType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setStampType(type)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-md border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="transform scale-90">
                  <StampBadge type={type} color={stampColor} size="sm" />
                </div>
                <span className="text-[9px] font-mono-stamp text-stone-500 mt-1">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Stamp Colors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono-stamp text-stone-400">Ink:</span>
          <div className="flex items-center gap-1.5">
            {STAMP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setStampColor(c)}
                className={`w-4 h-4 rounded-xs border border-stone-300 transition-transform cursor-pointer ${
                  stampColor === c ? 'scale-125 ring-2 ring-stone-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action Button: Mail Postcard (Exchange) */}
      <div className="pt-2">
        <button
          id="btn-mail-postcard"
          type="button"
          onClick={onMail}
          disabled={isMailing || !title.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold rounded-md transition-colors cursor-pointer text-sm"
        >
          <Send className="w-4 h-4" />
          <span>Mail to a Random Stranger & Swap Art</span>
        </button>
        <p className="text-[11px] text-center text-stone-400 mt-2 font-mono-stamp">
          Your 32×32 art will travel to an anonymous stranger. You will immediately receive one in return!
        </p>
      </div>
    </div>
  );
};
