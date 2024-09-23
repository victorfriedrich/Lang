import React, { useState, useRef, useEffect } from 'react';


const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
  
    const showTooltip = () => {
      timerRef.current = setTimeout(() => setIsVisible(true), 200);
    };
  
    const hideTooltip = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsVisible(false);
    };
  
    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);
  
    return (
      <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
        {children}
        {isVisible && (
          <div
            ref={tooltipRef}
            className="absolute z-20 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip"
            style={{
              top: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap'
            }}
          >
            {content}
            <div 
              className="absolute w-3 h-3 bg-gray-900 transform rotate-45 -top-1.5 left-1/2 -translate-x-1/2"
              style={{ clipPath: 'polygon(100% 0, 0 100%, 0 0)' }}
            ></div>
          </div>
        )}
      </div>
    );
  };

export default Tooltip;