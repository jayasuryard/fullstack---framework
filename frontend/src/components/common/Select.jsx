import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  error,
  disabled = false,
  className = '',
  name,
  id,
  placeholder = 'Select...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputId = id || name;

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (onChange) {
      // Pass a synthetic event so existing form handlers work without changes
      onChange({ target: { name, value: optionValue } });
    }
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        id={inputId}
        className={`
          relative flex items-center justify-between px-4 py-3 border rounded-xl text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-orange-300'}
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          transition-all
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-orange-500' : ''}`} size={12} />
      </div>

      {isOpen && (
        <div className="absolute z-[9999] top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in py-1">
          <ul className="flex flex-col">
            <li
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${!value ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </li>
            {options.map((option, index) => (
              <li
                key={index}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === option.value ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600 font-medium'}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};