// ============================================================================
// ГРАВИРОВАННАЯ КАВКАЗСКАЯ ИКОНОГРАФИКА XIX ВЕКА (БРОНЗА, СУРГУЧ, ЧЕРНИЛА)
// Заменяет разнородные системные цветные эмодзи в ключевом HUD на единый
// исторический стиль в духе Crusader Kings III / Victoria 3 / Suzerain.
// ============================================================================
import React from 'react';

export function ShashkaSabersIcon({ className = 'w-3.5 h-3.5', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path
        d="M3.2 16.4C7.4 12.2 11.8 7.5 16.6 2.8M16.6 2.8L14.5 3.1M16.6 2.8L16.3 4.9"
        stroke={color}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.2 17.4L4.4 15.2M4.9 16.9L2.9 14.9" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M16.8 16.4C12.6 12.2 8.2 7.5 3.4 2.8M3.4 2.8L5.5 3.1M3.4 2.8L3.7 4.9"
        stroke={color}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.8 17.4L15.6 15.2M15.1 16.9L17.1 14.9" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function UnicornCannonIcon({ className = 'w-3.5 h-3.5', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path
        d="M3.5 11.2L15.8 5.6L16.9 7.8L4.8 13.2Z"
        fill={color}
        fillOpacity="0.22"
        stroke={color}
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path d="M2.2 15.6L7.6 12.2L11.4 15.6" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8.2" cy="14.2" r="3.1" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.45" />
      <circle cx="8.2" cy="14.2" r="0.9" fill="#fbbf24" />
      <circle cx="17.8" cy="5.8" r="1.15" fill="#fb923c" />
    </svg>
  );
}

export function WaxSealIcon({ className = 'w-3.5 h-3.5', color = '#ef4444' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path
        d="M10 2.1L12.4 3.2L15 3.1L16.2 5.4L18 7.4L17.2 10L18 12.6L16.2 14.6L15 16.9L12.4 16.8L10 17.9L7.6 16.8L5 16.9L3.8 14.6L2 12.6L2.8 10L2 7.4L3.8 5.4L5 3.1L7.6 3.2Z"
        fill={color}
        fillOpacity="0.88"
        stroke="#fde68a"
        strokeWidth="1.2"
      />
      <circle cx="10" cy="10" r="4.3" stroke="#fef08a" strokeWidth="1.1" />
      <path d="M8.2 10.2L9.6 11.6L12.2 8.6" stroke="#fef08a" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WatchtowerIcon({ className = 'w-3.5 h-3.5', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path
        d="M5.2 17.5L6.8 4.2H13.2L14.8 17.5H5.2Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path d="M5.8 4.2V2.6H8V4.2M9 4.2V2.6H11V4.2M12 4.2V2.6H14.2V4.2" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <rect x="9" y="8.2" width="2" height="3.2" rx="0.8" fill={color} />
      <line x1="3.5" y1="17.5" x2="16.5" y2="17.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ImperialEagleIcon({ className = 'w-3.5 h-3.5', color = '#fca5a5' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path
        d="M10 3.2L8.4 5.2L6.6 4.4L7.2 6.8L3 5.8L5.2 9.4L3.6 11.6L6.8 11.8L6.2 15.8L10 13.8L13.8 15.8L13.2 11.8L16.4 11.6L14.8 9.4L17 5.8L12.8 6.8L13.4 4.4L11.6 5.2L10 3.2Z"
        fill={color}
        fillOpacity="0.24"
        stroke={color}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="2.2" r="1" fill="#fbbf24" />
    </svg>
  );
}

export function HighlandEagleIcon({ className = 'w-3.5 h-3.5', color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path
        d="M2 8.6C5.2 5.4 7.8 6.2 10 8.5C12.2 6.2 14.8 5.4 18 8.6C15.2 9.2 13 10.6 10 13.8C7 10.6 4.8 9.2 2 8.6Z"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path d="M8.4 13.4L10 16.4L11.6 13.4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PowderFlaskIcon({ className = 'w-3.5 h-3.5', color = '#fdba74' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <rect x="5.2" y="4.2" width="9.6" height="12.4" rx="2.4" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.45" />
      <line x1="5.4" y1="8" x2="14.6" y2="8" stroke="#fbbf24" strokeWidth="1.2" />
      <line x1="5.4" y1="12.8" x2="14.6" y2="12.8" stroke="#fbbf24" strokeWidth="1.2" />
      <path d="M10 4.2V2.2L12.2 1.8" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SpyglassLensIcon({ className = 'w-3.5 h-3.5', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <circle cx="9" cy="9" r="5.6" stroke={color} strokeWidth="1.55" fill={color} fillOpacity="0.12" />
      <line x1="13.2" y1="13.2" x2="17.4" y2="17.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.8 7.2A3 3 0 0 1 10.8 6.4" stroke="#fde68a" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function CompassRoseIcon({ className = 'w-3.5 h-3.5', color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <circle cx="10" cy="10" r="7.4" stroke={color} strokeWidth="1.25" strokeOpacity="0.7" />
      <polygon points="10,2.4 11.9,8.1 17.6,10 11.9,11.9 10,17.6 8.1,11.9 2.4,10 8.1,8.1" fill={color} fillOpacity="0.28" stroke={color} strokeWidth="1.15" />
      <circle cx="10" cy="10" r="1.4" fill="#fef08a" />
    </svg>
  );
}

export function SignalBeaconIcon({ className = 'w-3.5 h-3.5', color = '#fb7185' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path d="M10 3.2C12.4 5.8 12.8 8.2 10 10.6C7.2 8.2 7.6 5.8 10 3.2Z" fill={color} stroke="#fde68a" strokeWidth="1.1" />
      <path d="M6.5 17.2L7.8 11.4H12.2L13.5 17.2H6.5Z" stroke={color} strokeWidth="1.35" fill={color} fillOpacity="0.2" />
      <path d="M4.2 6.2A6.8 6.8 0 0 0 4.2 11.8M15.8 6.2A6.8 6.8 0 0 1 15.8 11.8" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function MountainPeakIcon({ className = 'w-3.5 h-3.5', color = '#7dd3fc' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path d="M2.2 16.2L8.2 5.2L12.4 12.2L14.8 8.6L18.2 16.2H2.2Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.4 8.5L8.2 5.2L10 8.5L8.2 7.8L6.4 8.5Z" fill="#f8fafc" />
    </svg>
  );
}

export function SeveredConvoyIcon({ className = 'w-3.5 h-3.5', color = '#fb923c' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path d="M2.5 10H7.5M12.5 10H17.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
      <path d="M7.2 4.5L12.8 15.5M12.8 4.5L7.2 15.5" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
