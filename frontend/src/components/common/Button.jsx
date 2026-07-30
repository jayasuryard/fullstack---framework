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
    primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 border border-transparent',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-transparent',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 border border-transparent',
    outline: 'bg-transparent border-2 border-gray-200 text-gray-600 hover:border-gray-300'
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