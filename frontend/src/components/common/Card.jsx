import React from 'react';

export default function Card({ title, action, children, padding = true, className = '', onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : 'hover:shadow-sm'
      } ${padding ? 'p-6' : ''} ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {action && action}
        </div>
      )}
      {children}
    </div>
  );
}