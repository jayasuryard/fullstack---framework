import React from 'react';

export default function Card({ title, action, children, padding = true, className = '', onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white/70 transition-all ${
        onClick ? 'cursor-pointer hover:bg-white/[0.07]' : ''
      } ${padding ? 'p-6' : ''} ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {action && action}
        </div>
      )}
      {children}
    </div>
  );
}