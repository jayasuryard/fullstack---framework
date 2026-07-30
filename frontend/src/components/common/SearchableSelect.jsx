// import React, { useState, useEffect, useRef } from 'react';

// export const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", disabled = false, className = "" }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState('');
//   const wrapperRef = useRef(null);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const selectedOption = options.find(opt => opt.value === value);
//   const filteredOptions = options.filter(opt =>
//     opt.label.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div  ref={wrapperRef} className={`relative z-50 ${className}`}>
//       <div
//         className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-white flex justify-between items-center transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'cursor-pointer focus-within:ring-2 focus-within:ring-orange-500'}`}
//         onClick={() => !disabled && setIsOpen(!isOpen)}
//       >
//         <span className={`truncate pr-4 ${selectedOption ? 'text-gray-800 text-sm' : 'text-gray-400 text-sm'}`}>
//           {selectedOption ? selectedOption.label : placeholder}
//         </span>
//         <span className="text-gray-400 text-xs absolute right-3 pointer-events-none">▼</span>
//       </div>

//       {isOpen && !disabled && (
//         <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
//           <div className="p-2 border-b border-gray-100 shrink-0 bg-gray-50">
//             <input
//               type="text"
//               className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
//               placeholder="Type to search..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               onClick={(e) => e.stopPropagation()}
//               autoFocus
//             />
//           </div>
//           <div className="overflow-y-auto flex-1">
//             {filteredOptions.length > 0 ? (
//               filteredOptions.map(opt => (
//                 <div
//                   key={opt.value}
//                   className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors"
//                   onClick={() => {
//                     onChange(opt.value);
//                     setIsOpen(false);
//                     setSearch('');
//                   }}
//                 >
//                   {opt.label}
//                 </div>
//               ))
//             ) : (
//               <div className="px-4 py-3 text-sm text-gray-400 text-center italic">No matches found</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  isSearchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropStyle, setDropStyle] = useState({});
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !document.getElementById('searchable-select-portal')?.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate position on open and on scroll/resize
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const calculatePosition = () => {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 260;
      const spaceBelow = viewportHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

      setDropStyle({
        position: 'fixed',
        width: rect.width,
        left: rect.left,
        zIndex: 99999,
        ...(openUpward
          ? { bottom: viewportHeight - rect.top, top: 'auto' }
          : { top: rect.bottom + 2, bottom: 'auto' }),
      });
    };

    calculatePosition();

    // Reposition on scroll or resize (handles scrolling inside modal)
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);
    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && isSearchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [isOpen, isSearchable]);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = isSearchable
    ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleOpen = () => {
    if (!disabled) setIsOpen(prev => !prev);
  };

  const dropdown = isOpen && !disabled ? (
    <div
      id="searchable-select-portal"
      style={{ ...dropStyle, maxHeight: '260px' }}
      className="bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden"
    >
      {isSearchable && (
        <div className="p-2 border-b border-gray-100 shrink-0 bg-gray-50">
          <input
            ref={searchRef}
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="overflow-y-auto flex-1">
        {filteredOptions.length > 0 ? (
          filteredOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
                setSearch('');
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                ${opt.value === value
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
            >
              {opt.label}
            </div>
          ))
        ) : (
          <div className="px-4 py-4 text-sm text-gray-400 text-center italic">
            No matches found
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        onClick={handleOpen}
        className={`w-full border rounded-lg px-3 py-2 bg-white flex justify-between items-center transition-all select-none
          ${disabled
            ? 'bg-gray-100 cursor-not-allowed opacity-70 border-gray-200'
            : isOpen
              ? 'border-orange-400 ring-2 ring-orange-300 cursor-pointer'
              : 'border-gray-300 cursor-pointer hover:border-gray-400'
          }`}
      >
        <span className={`truncate pr-4 text-sm ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className={`text-gray-400 text-xs absolute right-3 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </div>

      {/* Portal dropdown — renders outside modal, no clipping */}
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
};