'use client';

import { useState, useEffect } from 'react';

interface RotatingTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export default function RotatingText({ words, className = '', interval = 3000 }: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsFlipping(false);
      }, 300); // Half of the flip animation duration
      
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className={`inline-block relative ${className}`}>
      <span 
        className={`
          inline-block font-bold transition-all duration-300 ease-in-out
          ${isFlipping 
            ? 'transform rotateX-90 opacity-0 scale-y-0' 
            : 'transform rotateX-0 opacity-100 scale-y-100'
          }
        `}
        style={{
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient-shift 3s ease-in-out infinite',
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {words[currentIndex]}
      </span>
    </div>
  );
} 