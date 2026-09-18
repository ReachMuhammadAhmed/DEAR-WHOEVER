import React from 'react';
import { X } from 'lucide-react';
import { Postcard } from '../types';
import { PostcardCard } from './PostcardCard';

interface PostcardInspectorModalProps {
  postcard: Postcard | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onRemix: (pixels: string[]) => void;
}

export const PostcardInspectorModal: React.FC<PostcardInspectorModalProps> = ({
  postcard,
  onClose,
  onLike,
  onRemix,
}) => {
  if (!postcard) return null;

  return (
    <div
      id="postcard-inspector-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
    >
      <div
        id="postcard-inspector-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-stone-50 rounded-xl border border-stone-300 p-6 sm:p-7 flex flex-col items-center animate-fade-in"
      >
        {/* Close button */}
        <button
          id="btn-close-inspector"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block text-[10px] font-mono-stamp text-stone-700 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-xs uppercase tracking-wider font-semibold">
              Postcard Inspector
            </span>
            {postcard.isFromPreviousStranger && (
              <span className="inline-block text-[10px] font-mono-stamp text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-xs uppercase tracking-wider font-semibold">
                From a previous stranger
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-stone-900 mt-1">
            {postcard.title}
          </h2>
          <p className="text-xs text-stone-500 font-mono-stamp">
            Click 'Read Note' to flip the postcard and see the handwritten message.
          </p>
        </div>

        {/* 3D Interactive Card */}
        <div className="w-full">
          <PostcardCard
            postcard={postcard}
            onLike={onLike}
            onRemix={(pixels) => {
              onRemix(pixels);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
