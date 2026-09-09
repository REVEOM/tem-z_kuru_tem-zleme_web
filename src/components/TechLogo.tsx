import React, { useState } from 'react';
import { useSettings } from '../context/useSettings';
import defaultLogo from '../assets/temiz-logo.svg';

interface TechLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const TechLogo: React.FC<TechLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true 
}) => {
  const { settings } = useSettings();
  const [imageError, setImageError] = useState(false);

  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const boxSize = isLarge ? 'w-11 h-11' : isSmall ? 'w-8 h-8' : 'w-9 h-9';
  const textSize = isLarge ? 'text-2xl' : isSmall ? 'text-lg' : 'text-xl';

  const logoSrc = settings.customLogoUrl?.trim() && !imageError
    ? settings.customLogoUrl.trim()
    : defaultLogo;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Square Emblem Box */}
      <div className={`${boxSize} rounded-xl overflow-hidden flex items-center justify-center p-0.5 bg-[#1475bc] shadow-md shadow-[#1475bc]/25 ring-1 ring-white/15 shrink-0 transition-transform active:scale-95`}>
        <img
          src={logoSrc}
          alt="TEMİZ Kuru Temizleme"
          className="w-full h-full object-contain rounded-lg"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Brand Name Typography */}
      <div>
        <div className="flex items-center gap-1">
          <span className={`font-black ${textSize} tracking-tight text-zinc-900 dark:text-white leading-none font-sans`}>
            TEMİZ<span className="text-[#1475bc]">.</span>
          </span>
        </div>

        {showSubtitle && (
          <span className="block text-[10px] font-bold tracking-wider text-[#1475bc] dark:text-[#38a3f5] uppercase mt-0.5 font-mono">
            Kuru Temizleme
          </span>
        )}
      </div>
    </div>
  );
};
