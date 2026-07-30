import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    default: 'bg-gray-50 text-gray-700 border border-gray-200'
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