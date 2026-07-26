'use client';

import { useState, useEffect } from 'react';
import { audioManager } from '@/lib/audioManager';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  playAudio?: boolean;
}

export default function TypewriterText({ text, speed = 30, className = '', onComplete, playAudio = false }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Play click sound randomly or on every character for flavor
        if (playAudio && Math.random() > 0.6) {
          audioManager.playClick();
        }
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, onComplete, playAudio]);

  return (
    <span className={className}>
      {displayedText}
      <span className={currentIndex < text.length ? 'opacity-100 crt-flicker' : 'opacity-0'}>_</span>
    </span>
  );
}
