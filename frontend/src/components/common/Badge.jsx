import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    success: 'bg-green-500/10 text-green-300 border border-green-400/30',
    danger: 'bg-red-500/10 text-red-300 border border-red-400/30',
    warning: 'bg-yellow-500/10 text-yellow-300 border border-yellow-400/30',
    primary: 'bg-blue-500/10 text-blue-300 border border-blue-400/30',
    default: 'bg-white/5 text-white/60 border border-white/15'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}