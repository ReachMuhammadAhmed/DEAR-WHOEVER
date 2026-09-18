import React, { useState } from 'react';
import { RotateCw, Heart, Download, Palette, MapPin, Calendar } from 'lucide-react';
import { Postcard } from '../types';
import { CANVAS_SIZE, DEFAULT_BG_COLOR, downloadPixelArt } from '../utils/pixelUtils';
import { StampBadge } from './StampBadge';
import { PostmarkStamp } from './PostmarkStamp';
import { PixelArtDisplay } from './PixelArtDisplay';

interface PostcardCardProps {
  postcard: Postcard;
  onLike?: (id: string) => void;
  onRemix?: (pixels: string[]) => void;
  isCompact?: boolean;
  onClick?: () => void;
}

export const PostcardCard: React.FC<PostcardCardProps> = ({
  postcard,
  onLike,
  onRemix,
  isCompact = false,
  onClick,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanTitle = postcard.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    downloadPixelArt(postcard.pixels, `${cleanTitle}-32x32.png`, 16);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) onLike(postcard.id);
  };

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemix) onRemix(postcard.pixels);
  };

  const formattedDate = new Date(postcard.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (isCompact) {
    return (
      <div
        id={`postcard-thumb-${postcard.id}`}
        onClick={onClick}
        className="group relative flex flex-col bg-[#FDFBF7] rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-[#FAF6EE] transition-colors cursor-pointer overflow-hidden p-3"
      >
        {/* Top Header with Stamp & Postmark */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col min-w-0 pr-2">
            <h4 className="text-xs font-bold text-stone-800 truncate group-hover:text-amber-700 transition-colors">
              {postcard.title}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-stone-400 truncate">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{postcard.location}</span>
            </div>
          </div>
          <div className="shrink-0 transform rotate-2 group-hover:rotate-0 transition-transform">
            <StampBadge type={postcard.stampType} color={postcard.stampColor} size="sm" />
          </div>
        </div>

        {/* 32x32 Artwork Container */}
        <div className="relative aspect-square w-full rounded-sm overflow-hidden border border-stone-200 pixelated bg-stone-100 flex items-center justify-center">
          <PixelArtDisplay pixels={postcard.pixels} />

          {/* Badge indicator if sent by user */}
          {postcard.isUserSent && (
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-xs bg-amber-600 text-white font-mono-stamp text-[8px] tracking-wider uppercase font-semibold">
              YOU SENT
            </span>
          )}
          {postcard.isFromPreviousStranger && (
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-xs bg-amber-800 text-amber-50 font-mono-stamp text-[8px] tracking-wider uppercase font-semibold border border-amber-700">
              FROM PREVIOUS STRANGER
            </span>
          )}
          {!postcard.isFromPreviousStranger && postcard.isUserReceived && (
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-xs bg-indigo-700 text-white font-mono-stamp text-[8px] tracking-wider uppercase font-semibold">
              RECEIVED
            </span>
          )}
        </div>

        {/* Card Footer Info */}
        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-stone-200/60 text-[10px] text-stone-500">
          <span className="truncate max-w-[110px] font-medium">by {postcard.sender}</span>
          <div className="flex items-center gap-2 shrink-0">
            {postcard.likes !== undefined && (
              <span className="flex items-center gap-0.5 text-stone-500 font-mono-stamp text-[9px]">
                <Heart className={`w-2.5 h-2.5 ${postcard.hasLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                {postcard.likes}
              </span>
            )}
            <span className="font-mono-stamp text-[9px] text-stone-400">{formattedDate}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full interactive 3D Flip Card
  return (
    <div
      id={`postcard-card-${postcard.id}`}
      className="perspective-1000 w-full max-w-md mx-auto"
    >
      <div
        className={`relative w-full aspect-[4/3] rounded-xl transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT: Pixel Artwork & Postage Stamp */}
        <div className="absolute inset-0 w-full h-full bg-[#FDFBF7] rounded-xl border-2 border-stone-300 p-4 sm:p-5 flex flex-col justify-between backface-hidden">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {postcard.title}
                </h3>
                {postcard.isFromPreviousStranger && (
                  <span className="px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-300 font-mono-stamp text-[9px] tracking-wide font-semibold uppercase">
                    From a previous stranger
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {postcard.location}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PostmarkStamp location={postcard.location} date={postcard.createdAt} className="hidden sm:inline-flex" />
              <StampBadge type={postcard.stampType} color={postcard.stampColor} size="md" />
            </div>
          </div>

          {/* Centerpiece: 32x32 Artwork */}
          <div className="flex items-center justify-center my-auto py-2">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-md overflow-hidden border border-stone-300 pixelated bg-stone-100">
              <PixelArtDisplay pixels={postcard.pixels} />
            </div>
          </div>

          {/* Bottom Card Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <span className="font-mono-stamp text-[10px] text-stone-400">
                FROM: {postcard.sender}
              </span>
              {postcard.likes !== undefined && (
                <button
                  id={`btn-like-${postcard.id}`}
                  type="button"
                  onClick={handleLike}
                  className="flex items-center gap-1 text-xs hover:text-rose-600 transition-colors font-mono-stamp cursor-pointer"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      postcard.hasLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                    }`}
                  />
                  <span>{postcard.likes}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {onRemix && (
                <button
                  id={`btn-remix-${postcard.id}`}
                  type="button"
                  onClick={handleRemix}
                  title="Remix artwork into canvas"
                  className="p-1.5 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                id={`btn-download-${postcard.id}`}
                type="button"
                onClick={handleDownload}
                title="Download 32x32 PNG"
                className="p-1.5 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                id={`btn-flip-${postcard.id}`}
                type="button"
                onClick={handleFlip}
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-medium text-xs transition-colors ml-1 cursor-pointer border border-stone-200"
              >
                <RotateCw className="w-3 h-3" />
                <span>Read Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* BACK: Message, Address Lines, Stamp, Cancellation */}
        <div className="absolute inset-0 w-full h-full bg-[#FAF7F2] rounded-xl border-2 border-stone-300 p-5 flex flex-col justify-between rotate-y-180 backface-hidden">
          {/* Header with Postmark and Stamp */}
          <div className="flex items-start justify-between pb-3 border-b border-stone-200">
            <div>
              <span className="font-mono-stamp text-[10px] tracking-widest text-stone-400 uppercase">
                POST CARD • CARTE POSTALE
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono-stamp text-stone-500">
                  EXCHANGE NETWORK #32
                </span>
                {postcard.isFromPreviousStranger && (
                  <span className="text-[9px] font-mono-stamp text-amber-800 bg-amber-100/70 border border-amber-300 px-1 rounded-xs uppercase font-semibold">
                    From a previous stranger
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PostmarkStamp location={postcard.location} date={postcard.createdAt} />
              <StampBadge type={postcard.stampType} color={postcard.stampColor} size="sm" />
            </div>
          </div>

          {/* Divided Body: Left is Message, Right is Address Lines */}
          <div className="grid grid-cols-2 gap-4 my-auto py-2">
            {/* Left Column: Handwritten-style Message */}
            <div className="flex flex-col justify-between pr-3 border-r border-dashed border-stone-300">
              <p className="text-stone-800 text-xs sm:text-sm font-serif italic leading-relaxed whitespace-pre-wrap">
                "{postcard.message || 'Greetings from across the miles. Enjoy this little piece of pixel art!'}"
              </p>
              <div className="mt-3 pt-2">
                <span className="text-[11px] font-mono-stamp text-stone-500">
                  — {postcard.sender}
                </span>
              </div>
            </div>

            {/* Right Column: Traditional Address Lines */}
            <div className="flex flex-col justify-center space-y-3 pl-2">
              <div className="border-b border-stone-300 pb-1 text-[11px] font-mono-stamp text-stone-400">
                TO: A Random Stranger
              </div>
              <div className="border-b border-stone-300 pb-1 text-[11px] font-mono-stamp text-stone-400">
                LOCATION: Earth
              </div>
              <div className="border-b border-stone-300 pb-1 text-[11px] font-mono-stamp text-stone-400">
                ORIGIN: {postcard.location}
              </div>
              <div className="border-b border-stone-300 pb-1 text-[10px] font-mono-stamp text-stone-300">
                DATE: {new Date(postcard.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Back Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <span className="font-mono-stamp text-[10px] text-stone-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(postcard.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            <button
              id={`btn-flip-back-${postcard.id}`}
              type="button"
              onClick={handleFlip}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md font-medium text-xs transition-colors cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>View Artwork</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
