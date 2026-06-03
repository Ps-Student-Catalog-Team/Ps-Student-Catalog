import { createContext, useContext, useState, type ReactNode } from 'react';

interface HoverContextType {
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export function HoverProvider({ children }: { children: ReactNode }) {
  const [isHovering, setIsHovering] = useState(false);

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
