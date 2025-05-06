import React, { useRef, useEffect } from 'react';

interface ScrollableContentProps {
  children: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
}

const ScrollableContent = ({ children, onScroll }: ScrollableContentProps) => {
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
    <div ref={scrollRef} className="flex-grow overflow-y-auto">
      {children}
    </div>
  );
};

export { ScrollableContent };
