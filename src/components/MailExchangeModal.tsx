import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  CheckCircle2,
  Globe,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  Info,
  Radio,
  Send,
  Archive,
} from 'lucide-react';
import { Postcard } from '../types';
import { PostcardCard } from './PostcardCard';
import { createRandomStrangerExchangePostcard } from '../data/seedPostcards';

interface MailExchangeModalProps {
  isOpen: boolean;
  sentPostcard: Postcard;
  postcardsPool: Postcard[];
  onClose: () => void;
  onPostcardReceived: (card: Postcard) => void;
  onLikeReceived: (id: string) => void;
  onRemixReceived: (pixels: string[]) => void;
}

const TOTAL_WAIT_SECONDS = 60; // 1 minute timeout

const LIVE_STATUS_MESSAGES = [
  'Connecting to global postal exchange relay...',
  'Broadcasting your 32×32 pixel art to connected mail hubs...',
  'Searching for active strangers drawing at their canvas in Tokyo, Berlin, Kyoto, Lisbon...',
  'Holding open your postal pigeonhole for an incoming response...',
  'Listening for a stranger to seal and frank their return postcard...',
  'Polling international mailstream for completed exchanges...',
];

export const MailExchangeModal: React.FC<MailExchangeModalProps> = ({
  isOpen,
  sentPostcard,
  postcardsPool,
  onClose,
  onPostcardReceived,
  onLikeReceived,
  onRemixReceived,
}) => {
  // Stages: 'waiting' | 'revealed'
  const [stage, setStage] = useState<'waiting' | 'revealed'>('waiting');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_WAIT_SECONDS);
  const [statusMessageIndex, setStatusMessageIndex] = useState<number>(0);
  const [receivedCard, setReceivedCard] = useState<Postcard | null>(null);

  const hasDeliveredRef = useRef<boolean>(false);

  // Deliver response from previous stranger
  const deliverPreviousStrangerCard = (reason: 'timeout' | 'manual_dev') => {
    if (hasDeliveredRef.current) return;
    hasDeliveredRef.current = true;

    // Pick a response from a previous participant
    const fallbackPostcard = createRandomStrangerExchangePostcard({
      isFromPreviousStranger: true,
      pool: postcardsPool,
    });

    setReceivedCard(fallbackPostcard);
    onPostcardReceived(fallbackPostcard);
    setStage('revealed');
  };

  // Timer & status ticker management
  useEffect(() => {
    if (!isOpen) {
      setStage('waiting');
      setSecondsRemaining(TOTAL_WAIT_SECONDS);
      setStatusMessageIndex(0);
      setReceivedCard(null);
      hasDeliveredRef.current = false;
      return;
    }

    // Interval for 1-minute countdown
    const timerInterval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          // 1 minute elapsed without live stranger response -> automatically display random response from previous participant
          deliverPreviousStrangerCard('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Interval for rotating live status ticker every 3.5s
    const statusInterval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % LIVE_STATUS_MESSAGES.length);
    }, 3500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(statusInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Format seconds into MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((TOTAL_WAIT_SECONDS - secondsRemaining) / TOTAL_WAIT_SECONDS) * 100;

  return (
    <div
      id="mail-exchange-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        id="mail-exchange-modal-content"
        className="relative w-full max-w-xl bg-[#FDFBF7] rounded-xl border border-stone-300 p-5 sm:p-7 flex flex-col items-center overflow-hidden my-auto shadow-none"
      >
        {/* =========================================================================
            STATE 1: DEDICATED LOADING/WAITING STATE
            "Waiting for another stranger to respond…"
           ========================================================================= */}
        {stage === 'waiting' && (
          <div className="flex flex-col items-center w-full text-center">
            {/* Radar / Beacon Animation Header */}
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 border border-amber-200">
                <Radio className="w-8 h-8 animate-pulse text-amber-700" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-600"></span>
              </span>
            </div>

            {/* Required Primary Heading */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-amber-100/80 text-amber-900 border border-amber-300 text-[10px] font-mono-stamp uppercase tracking-widest font-semibold mb-2">
              <Clock className="w-3 h-3" /> Live Exchange Dispatch
            </div>
            <h2
              id="exchange-waiting-heading"
              className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight"
            >
              Waiting for another stranger to respond…
            </h2>

            {/* Clear Explanation of the Exchange Flow */}
            <div className="mt-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-left w-full text-xs sm:text-[13px] text-stone-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-800 mb-1">
                    How the stranger exchange works:
                  </p>
                  <p className="text-stone-600">
                    Your 32×32 pixel postcard has been stamped and dispatched into the global mailstream!
                    The network matches you with another artist anywhere in the world. We are holding your
                    mailbox open while waiting for another visitor to complete and seal a postcard to swap with you.
                  </p>
                </div>
              </div>
            </div>

            {/* Outgoing Postcard Confirmation Badge */}
            <div className="w-full mt-3 p-2.5 bg-amber-50/60 rounded-md border border-amber-200 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-amber-700 text-white flex items-center justify-center font-mono-stamp text-xs font-bold shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono-stamp text-stone-400 uppercase block">
                    You dispatched:
                  </span>
                  <span className="text-xs font-bold text-stone-900 truncate max-w-[200px] sm:max-w-[280px] block">
                    "{sentPostcard.title}"
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono-stamp text-stone-500 shrink-0 text-right">
                from {sentPostcard.location}
              </span>
            </div>

            {/* Live 1-Minute Countdown Timer & Progress Meter */}
            <div className="w-full mt-4 p-4 bg-white rounded-lg border border-stone-200 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 font-mono-stamp uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Response Window
                </span>
                <span className="font-mono-stamp font-bold text-base text-stone-900">
                  {formattedTime}
                </span>
              </div>

              {/* Progress Bar (60s countdown) */}
              <div className="w-full h-2 bg-stone-100 rounded-xs overflow-hidden border border-stone-200">
                <div
                  className="h-full bg-amber-600 transition-all duration-1000 ease-linear rounded-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Live Status Ticker */}
              <div className="flex items-center gap-2 mt-3 text-xs text-stone-500 font-mono-stamp h-6 overflow-hidden">
                <Globe className="w-3.5 h-3.5 text-stone-400 animate-spin shrink-0" />
                <span className="truncate animate-fade-in">
                  {LIVE_STATUS_MESSAGES[statusMessageIndex]}
                </span>
              </div>
            </div>

            {/* Fallback Guarantee Explanation */}
            <div className="mt-3.5 text-left text-xs text-stone-500 bg-stone-100/70 p-3 rounded-md border border-stone-200 w-full">
              <p className="flex items-start gap-1.5 leading-snug">
                <Archive className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-700">1-Minute Fallback Guarantee:</strong> If no new response is received within 1 minute, the system will automatically display a random response from a previous participant labeled <strong className="text-stone-800">“From a previous stranger”</strong> so your mailbox is never left empty.
                </span>
              </p>
            </div>

            {/* Dev & Testing Fast-Forward Button */}
            <div className="mt-5 pt-3 border-t border-stone-200 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="text-[11px] font-mono-stamp text-stone-400">
                DEVELOPMENT / FALLBACK TESTING
              </span>
              <button
                id="btn-fast-forward-fallback"
                type="button"
                onClick={() => deliverPreviousStrangerCard('manual_dev')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-semibold font-mono-stamp transition-colors cursor-pointer border border-stone-300"
                title="Simulate 1-minute timeout immediately"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Trigger 1-Min Fallback Now (Dev)</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: REVEALED / RECEIVED STATE
            "From a previous stranger"
           ========================================================================= */}
        {stage === 'revealed' && receivedCard && (
          <div className="flex flex-col items-center w-full animate-fade-in">
            {/* Distinct archival source banner */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold font-mono-stamp tracking-wide mb-1.5 uppercase">
                <Archive className="w-3.5 h-3.5 text-amber-700" />
                From a previous stranger
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                You received a miniature piece of art!
              </h3>
              <p className="text-xs text-stone-500 font-mono-stamp mt-0.5">
                Sent by {receivedCard.sender} from {receivedCard.location}
              </p>
              <p className="text-[11px] text-stone-500 mt-1 max-w-md mx-auto">
                No new live response arrived within 1 minute, so our postal service delivered this postcard from a previous participant in the exchange archive.
              </p>
            </div>

            {/* The Received Postcard Card (Full 3D Flip capability) */}
            <div className="w-full max-w-md my-2">
              <PostcardCard
                postcard={receivedCard}
                onLike={onLikeReceived}
                onRemix={onRemixReceived}
              />
            </div>

            {/* Exchange Details & Actions */}
            <div className="w-full max-w-md mt-5 pt-3.5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-[10px] font-mono-stamp text-stone-400 block uppercase">
                  WALL ARCHIVE
                </span>
                <span className="text-xs font-medium text-stone-700">
                  Safely stored in the communal wall of 100!
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-view-on-wall"
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>View on Gallery Wall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
