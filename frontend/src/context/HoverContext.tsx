import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface HoverContextType {
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export function HoverProvider({ children }: { children: ReactNode }) {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], [data-hoverable], input, textarea, select');
      if (isInteractive) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], [data-hoverable], input, textarea, select');
      if (isInteractive) {
        const relatedTarget = e.relatedTarget as HTMLElement;
        const isStillOverInteractive = relatedTarget?.closest('button, a, [role="button"], [data-hoverable], input, textarea, select');
        if (!isStillOverInteractive) {
          setIsHovering(false);
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <HoverContext.Provider value={{ isHovering, setIsHovering }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHover() {
  const context = useContext(HoverContext);
  if (!context) {
    throw new Error('useHover must be used within a HoverProvider');
  }
  return context;
}
