import React from 'react';

interface PostmarkStampProps {
  location?: string;
  date?: string | number;
  className?: string;
  color?: string;
}

export const PostmarkStamp: React.FC<PostmarkStampProps> = ({
  location = 'ANONYMOUS POST',
  date,
  className = '',
  color = '#78716C', // Slate/Ink color
}) => {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase()
    : 'AIR MAIL';

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none pointer-events-none opacity-80 ${className}`}
      style={{ color }}
    >
      {/* Circular Postmark */}
      <div className="relative w-12 h-12 rounded-full border border-dashed border-current flex flex-col items-center justify-center p-0.5 text-center rotate-[-8deg]">
        <div className="text-[6px] font-mono-stamp tracking-wider uppercase truncate max-w-[42px]">
          {location.split(',')[0]}
        </div>
        <div className="text-[6.5px] font-mono-stamp font-bold tracking-tight my-0.5 border-y border-current w-4/5 py-0.5">
          {formattedDate}
        </div>
        <div className="text-[5.5px] font-mono-stamp tracking-widest uppercase">
          PIXEL-32
        </div>
      </div>

      {/* Wavy Cancellation Lines */}
      <div className="flex flex-col gap-1 w-8 justify-center py-1">
        <div className="h-[1px] bg-current rounded-full w-full opacity-70 transform -skew-y-3" />
        <div className="h-[1px] bg-current rounded-full w-4/5 opacity-70 transform -skew-y-3" />
        <div className="h-[1px] bg-current rounded-full w-full opacity-70 transform -skew-y-3" />
      </div>
    </div>
  );
};
