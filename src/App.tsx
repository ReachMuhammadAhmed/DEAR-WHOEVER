import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Heart,
  Palette,
  Lightbulb,
  Info,
  Layers,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import { Postcard, StampType } from './types';
import { createEmptyCanvas, DEFAULT_BG_COLOR } from './utils/pixelUtils';
import { SEED_POSTCARDS, createRandomStrangerExchangePostcard } from './data/seedPostcards';
import { PixelCanvas } from './components/PixelCanvas';
import { PostcardForm } from './components/PostcardForm';
import { PostcardWall } from './components/PostcardWall';
import { MailExchangeModal } from './components/MailExchangeModal';
import { PostcardInspectorModal } from './components/PostcardInspectorModal';
import { StampBadge } from './components/StampBadge';

const STORAGE_KEY = 'pixel_postcard_wall_v1';
const DRAFT_KEY = 'pixel_postcard_draft_v1';

const INSPIRATION_PROMPTS = [
  'A steaming ceramic coffee mug with heart foam',
  'A sleepy orange cat curled up on a soft rug',
  'A crescent moon rising over dark pine hills',
  'A tiny red sailboat floating on turquoise sea',
  'A vintage handheld video game console',
  'A blooming cherry blossom twig in spring',
  'A little mushroom with white spots in moss',
  'A cozy wood cabin with smoke from chimney',
  'A bowl of hot ramen noodles with boiled egg',
  'A paper airplane gliding through evening clouds',
];

export default function App() {
  // Load draft if available
  const initialDraft = (() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return null;
  })();

  // Canvas drawing state
  const [pixels, setPixels] = useState<string[]>(() => {
    if (
      initialDraft?.pixels &&
      Array.isArray(initialDraft.pixels) &&
      initialDraft.pixels.length === 1024
    ) {
      return initialDraft.pixels;
    }
    return createEmptyCanvas();
  });

  // Postcard metadata state
  const [title, setTitle] = useState<string>(() => initialDraft?.title || 'Sunny Afternoon');
  const [message, setMessage] = useState<string>(
    () =>
      initialDraft?.message ||
      'Sending a little spark of joy from my desk to yours. Hope your day is peaceful!'
  );
  const [sender, setSender] = useState<string>(() => initialDraft?.sender || 'Anonymous Artist');
  const [location, setLocation] = useState<string>(() => initialDraft?.location || 'Kyoto, Japan');
  const [stampType, setStampType] = useState<StampType>(() => initialDraft?.stampType || 'sun');
  const [stampColor, setStampColor] = useState<string>(() => initialDraft?.stampColor || '#DC2626');

  // Persist draft to localStorage on any edit
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          pixels,
          title,
          message,
          sender,
          location,
          stampType,
          stampColor,
        })
      );
    } catch {
      // Ignore storage quota
    }
  }, [pixels, title, message, sender, location, stampType, stampColor]);

  // Communal Postcard Wall state (maximum 100)
  const [postcards, setPostcards] = useState<Postcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seeds
    }
    return SEED_POSTCARDS;
  });

  // Save to localStorage whenever postcards change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postcards.slice(0, 100)));
    } catch {
      // Ignore quota errors
    }
  }, [postcards]);

  // Exchange Modal State
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);
  const [lastSentPostcard, setLastSentPostcard] = useState<Postcard | null>(null);
  const [lastReceivedPostcard, setLastReceivedPostcard] = useState<Postcard | null>(null);

  // Inspector Lightbox State
  const [inspectedPostcard, setInspectedPostcard] = useState<Postcard | null>(null);

  // Inspiration prompt state
  const [currentPromptIdx, setCurrentPromptIdx] = useState<number>(0);

  // Handle liking / hearting a postcard
  const handleLikePostcard = (id: string) => {
    setPostcards((prev) =>
      prev.map((pc) => {
        if (pc.id === id) {
          const isLiked = pc.hasLiked;
          return {
            ...pc,
            likes: (pc.likes || 0) + (isLiked ? -1 : 1),
            hasLiked: !isLiked,
          };
        }
        return pc;
      })
    );
    if (inspectedPostcard && inspectedPostcard.id === id) {
      setInspectedPostcard((prev) =>
        prev
          ? {
              ...prev,
              likes: (prev.likes || 0) + (prev.hasLiked ? -1 : 1),
              hasLiked: !prev.hasLiked,
            }
          : null
      );
    }
  };

  // Handle remixing artwork into the editor
  const handleRemix = (remixPixels: string[]) => {
    setPixels([...remixPixels]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Explicitly clear art canvas & art review
  const handleClearArt = () => {
    const emptyCanvas = createEmptyCanvas();
    setPixels(emptyCanvas);
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          pixels: emptyCanvas,
          title,
          message,
          sender,
          location,
          stampType,
          stampColor,
        })
      );
    } catch {
      // Ignore
    }
  };

  // Trigger Postcard Mail & Exchange
  const handleMailExchange = () => {
    if (!title.trim()) return;

    const newSentCard: Postcard = {
      id: 'sent-' + Date.now(),
      title: title.trim(),
      pixels: [...pixels],
      sender: sender.trim() || 'Anonymous Artist',
      location: location.trim() || 'Everywhere & Nowhere',
      message: message.trim() || 'Greetings from a fellow artist on Earth.',
      stampType,
      stampColor,
      createdAt: Date.now(),
      isUserSent: true,
      likes: 1,
    };

    setLastSentPostcard(newSentCard);
    setIsExchangeModalOpen(true);

    // Add user's sent card to the gallery wall (limiting to last 100)
    setPostcards((prev) => {
      const updated = [newSentCard, ...prev];
      return updated.slice(0, 100);
    });

    // Reset canvas to a fresh slate and remove draft from storage
    setPixels(createEmptyCanvas());
    setTitle('Tiny Morning Sketch');
    setMessage('Hello to whoever finds this in their mailbox today.');
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore
    }
  };

  // Called when stranger response arrives (or fallback triggers)
  const handlePostcardReceived = (receivedCard: Postcard) => {
    setLastReceivedPostcard(receivedCard);
    setPostcards((prev) => {
      if (prev.some((p) => p.id === receivedCard.id)) return prev;
      const updated = [receivedCard, ...prev];
      return updated.slice(0, 100);
    });
  };

  const nextPrompt = () => {
    setCurrentPromptIdx((prev) => (prev + 1) % INSPIRATION_PROMPTS.length);
  };

  const userSentCount = postcards.filter((p) => p.isUserSent).length;
  const userReceivedCount = postcards.filter((p) => p.isUserReceived).length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans">
      {/* Top Ambient Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="transform -rotate-6">
              <StampBadge type="sun" color="#EA580C" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-stone-900 tracking-tight">
                  Pixel Postcard
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-xs bg-amber-50 text-amber-900 border border-amber-300/80 text-[10px] font-mono-stamp font-semibold tracking-wider uppercase">
                  32×32 ART EXCHANGE
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono-stamp hidden sm:block">
                Draw 32×32. Mail to a random stranger. Receive one back.
              </p>
            </div>
          </div>

          {/* User Exchange Stats & Quick Jump */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-mono-stamp bg-white px-3 py-1.5 rounded-md border border-stone-200">
              <div className="flex items-center gap-1 text-amber-700" title="Postcards you mailed">
                <Send className="w-3 h-3" />
                <span className="font-bold">{userSentCount}</span>
                <span className="hidden md:inline text-stone-400">sent</span>
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1 text-indigo-700" title="Postcards received from strangers">
                <Mail className="w-3 h-3" />
                <span className="font-bold">{userReceivedCount}</span>
                <span className="hidden md:inline text-stone-400">received</span>
              </div>
            </div>

            <a
              href="#postcard-wall-section"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">The Wall</span>
              <span className="text-[10px] opacity-75 font-mono-stamp">({postcards.length})</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-10">
        {/* Creative Philosophy & Inspiration Prompt Bar */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-200/80 text-amber-900 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-stamp text-amber-800 font-bold uppercase tracking-wider block">
                CREATIVE CONSTRAINT:
              </span>
              <p className="text-xs font-medium text-amber-950">
                Prompt Idea: <span className="font-bold underline decoration-amber-300">{INSPIRATION_PROMPTS[currentPromptIdx]}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={nextPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>New Prompt</span>
          </button>
        </section>

        {/* Studio Workspace: Canvas on Left/Center, Postcard Setup on Right */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Canvas Workspace (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                  Step 1: Paint on 32×32 Grid
                </h2>
              </div>
              <span className="text-xs font-mono-stamp text-stone-400">
                1024 Pixel Canvas
              </span>
            </div>

            <PixelCanvas
              pixels={pixels}
              onChange={setPixels}
              onClear={handleClearArt}
            />
          </div>

          {/* Postcard Details & Mail Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                Step 2: Prepare & Mail
              </h2>
              <span className="text-xs font-mono-stamp text-amber-700 font-medium">
                Instant Art Swap
              </span>
            </div>

            <PostcardForm
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
              sender={sender}
              setSender={setSender}
              location={location}
              setLocation={setLocation}
              stampType={stampType}
              setStampType={setStampType}
              stampColor={stampColor}
              setStampColor={setStampColor}
              onMail={handleMailExchange}
              pixels={pixels}
              onClearArt={handleClearArt}
            />
          </div>
        </section>

        {/* Scroll Indicator to Postcard Wall */}
        <div className="flex items-center justify-center my-2">
          <a
            href="#postcard-wall-section"
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors font-mono-stamp"
          >
            <span>Explore the Living Postcard Wall below</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>

        {/* The Postcard Wall: Living Gallery of 100 Tiny Artworks */}
        <PostcardWall
          postcards={postcards}
          onSelectPostcard={(pc) => setInspectedPostcard(pc)}
          onLike={handleLikePostcard}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 px-4 sm:px-6 text-center text-xs text-stone-400 font-mono-stamp mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Pixel Postcard • An anonymous exchange of 32×32 art</span>
          <span>The last 100 postcards live on the wall</span>
        </div>
      </footer>

      {/* Interactive Mail Exchange Experience Modal */}
      {lastSentPostcard && (
        <MailExchangeModal
          isOpen={isExchangeModalOpen}
          sentPostcard={lastSentPostcard}
          postcardsPool={postcards}
          onClose={() => setIsExchangeModalOpen(false)}
          onPostcardReceived={handlePostcardReceived}
          onLikeReceived={handleLikePostcard}
          onRemixReceived={handleRemix}
        />
      )}

      {/* Postcard Inspector Lightbox Modal */}
      <PostcardInspectorModal
        postcard={inspectedPostcard}
        onClose={() => setInspectedPostcard(null)}
        onLike={handleLikePostcard}
        onRemix={handleRemix}
      />
    </div>
  );
}
