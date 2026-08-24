// src/components/common/Input.jsx
import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  maxLength,
  disabled = false,
  readOnly = false,
  onKeyDown, // Catch custom onKeyDown if passed by a parent
  ...rest // Catch any other standard HTML props (like min, max, step)
}) {

  // Intercept key presses to block negative numbers and exponents
  const handleKeyDown = (e) => {
    if (type === 'number' && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
    }
    // If the parent component passed its own onKeyDown, call it too
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-white/70">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown} // Apply the blocker here
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        min={type === 'number' ? '0' : undefined} // Force UI to stop at 0
        className={`px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400/60 focus:bg-white/10 transition-all ${
          disabled ? 'bg-white/[0.03] text-white/30 cursor-not-allowed' : ''
        }`}
        {...rest}
      />
    </div>
  );
}