import React, { useRef, useEffect } from 'react';

interface ScrollableContentProps {
  children: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

const ScrollableContent = ({ children, onScroll, className = '' }: ScrollableContentProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const currentScrollTop = scrollRef.current.scrollTop;
        if (onScroll) {
          onScroll(currentScrollTop);
        }
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [onScroll]);

  return (
    <div
      ref={scrollRef}
      className={`bg-background text-text flex-grow overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
};

export { ScrollableContent };
