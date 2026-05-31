import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
}

export function useTypewriter({ text, speed = 50, delay = 0 }: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);
  
  // We track the text changes separately to avoid calling setState in effect
  const previousTextRef = useRef<string>('');

  useEffect(() => {
    // Only reset if the text has changed
    if (text !== previousTextRef.current) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setDisplayedText('');
        setIsTyping(false);
      }, 0);
      
      previousTextRef.current = text;
    }

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      intervalRef.current = window.setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsTyping(false);
        }
      }, speed);

      timeoutRef.current = startTimeout;
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, delay]);

  return { displayedText, isTyping };
}
