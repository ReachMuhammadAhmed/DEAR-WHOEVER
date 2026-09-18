import React from 'react';
import { Sun, Mountain, Cat, Coffee, Leaf, Star, Cloud, Heart, Compass } from 'lucide-react';
import { StampType } from '../types';

interface StampBadgeProps {
  type: StampType;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  type,
  color = '#DC2626',
  size = 'md',
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'sun':
        return <Sun className="w-full h-full" />;
      case 'mountain':
        return <Mountain className="w-full h-full" />;
      case 'cat':
        return <Cat className="w-full h-full" />;
      case 'coffee':
        return <Coffee className="w-full h-full" />;
      case 'botanical':
        return <Leaf className="w-full h-full" />;
      case 'star':
        return <Star className="w-full h-full" />;
      case 'cloud':
        return <Cloud className="w-full h-full" />;
      case 'heart':
        return <Heart className="w-full h-full" />;
      case 'lighthouse':
        return <Compass className="w-full h-full" />;
      default:
        return <Star className="w-full h-full" />;
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-9 text-[8px] p-0.5',
    md: 'w-9 h-12 text-[9px] p-1',
    lg: 'w-12 h-16 text-[10px] p-1.5',
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-between rounded-xs border border-dashed border-stone-300 bg-white select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Postage header */}
      <span className="font-mono-stamp font-bold uppercase tracking-wider text-[7px] text-stone-500">
        32¢
      </span>

      {/* Stamp graphic */}
      <div
        className="flex items-center justify-center w-full aspect-square rounded-xs p-1"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {getIcon()}
      </div>

      {/* Postage footer */}
      <span className="font-mono-stamp font-semibold uppercase tracking-tighter text-[6px] text-stone-400">
        POST
      </span>
    </div>
  );
};
