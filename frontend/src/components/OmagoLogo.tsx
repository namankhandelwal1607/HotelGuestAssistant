import React from 'react';

interface OmagoLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
  variant?: 'gradient' | 'white' | 'dark';
}

export const OmagoLogo: React.FC<OmagoLogoProps> = ({
  size = 38,
  className = '',
  showGlow = true,
  variant = 'gradient',
}) => {
  if (variant === 'white') {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Soft luminous purple glow behind center emblem */}
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full blur-xl bg-purple-400/50 pointer-events-none transform scale-150"
            aria-hidden="true"
          />
        )}
        {/* Exact stylized Omago aperture icon: smooth circle with angled curved leaf cutout */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M50 8C26.804 8 8 26.804 8 50C8 73.196 26.804 92 50 92C73.196 92 92 73.196 92 50C92 26.804 73.196 8 50 8ZM36.5 28C43.5 20 54.5 19 63 24.5L75 32.5C82.5 37.5 84.5 47.5 79.5 55L69 70C64 77.5 53.5 79.5 46 74.5L34 66.5C26.5 61.5 24.5 51.5 29.5 44L36.5 28Z"
            fill="white"
          />
          {/* Angled curved negative space slit creating the signature aperture look */}
          <path
            d="M38 38C44 28 58 29 65 37C72 45 68 59 58 66C48 73 37 68 33 58C29 48 32 44 38 38Z"
            fill="#B686F7"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft blurred radial glow aura */}
      {showGlow && (
        <div
          className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 opacity-75 blur-md pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Main gradient circular badge */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center shadow-sm overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #C026D3 100%)',
        }}
      >
        {/* Subtle interior highlight */}
        <div className="absolute inset-0 rounded-full bg-white/15 pointer-events-none" />

        {/* Crisp geometric aperture/lens mark matching screenshot */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[62%] h-[62%] text-white drop-shadow-sm"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M50 8C26.804 8 8 26.804 8 50C8 73.196 26.804 92 50 92C73.196 92 92 73.196 92 50C92 26.804 73.196 8 50 8ZM36.5 28C43.5 20 54.5 19 63 24.5L75 32.5C82.5 37.5 84.5 47.5 79.5 55L69 70C64 77.5 53.5 79.5 46 74.5L34 66.5C26.5 61.5 24.5 51.5 29.5 44L36.5 28Z"
            fill="white"
          />
          <path
            d="M38 38C44 28 58 29 65 37C72 45 68 59 58 66C48 73 37 68 33 58C29 48 32 44 38 38Z"
            fill="#8B5CF6"
          />
        </svg>
      </div>
    </div>
  );
};
