import React from 'react';

export default function Button({ 
  type = 'button', 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  children 
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all outline-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25 border border-transparent',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/15',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-transparent',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 border border-transparent',
    outline: 'bg-transparent border-2 border-white/15 text-white/70 hover:border-white/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-50 shadow-none hover:bg-opacity-100' : 'cursor-pointer'}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}