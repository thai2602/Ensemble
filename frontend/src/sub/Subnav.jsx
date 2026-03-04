import { useState, useEffect, useRef } from 'react';

export default function SubNav({ items = [], title = "Subnav", triggerMode = "hover" }) {
  const [openIndex, setOpenIndex] = useState(null);
  const navRef = useRef(null);

  // Determine if dropdown should use hover or click based on title or triggerMode
  const useClickMode = triggerMode === "click" || title === "onclick" || title === "actions" || title === "more";

  const handleToggle = (index) => {
    if (useClickMode) {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  const handleMouseEnter = (index) => {
    if (!useClickMode) {
      setOpenIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!useClickMode) {
      setOpenIndex(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!useClickMode || openIndex === null) return;

    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [useClickMode, openIndex]);

  return (
    <nav ref={navRef}>
      <ul className="flex space-x-6">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const hasSubMenu = item.subMenu && item.subMenu.length > 0;

          return (
            <li 
              key={index} 
              className={`relative ${hasSubMenu ? "group" : ""}`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="flex items-center transition h-full"
                onClick={() => handleToggle(index)}
              >
                {item.name}
              </button>

              {hasSubMenu && (
                <ul
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 min-w-max bg-white rounded-b-lg shadow-lg z-50
                             transition-all duration-200 transform
                             ${isOpen
                               ? 'opacity-100 visible translate-y-0'
                               : 'opacity-0 invisible translate-y-2'
                             }`}
                >
                  {item.subMenu.map((sub, subIndex) => (
                    <li
                      key={subIndex}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
