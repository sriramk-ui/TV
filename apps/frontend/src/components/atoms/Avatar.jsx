import React from 'react';

export default function Avatar({
  name = 'User',
  role = '',
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm font-bold rounded-xl',
    lg: 'w-12 h-12 text-base font-bold rounded-2xl'
  };

  return (
    <div
      className={`inline-grid place-items-center bg-blue-50 text-blue font-bold border border-blue-100 flex-shrink-0 select-none ${sizeStyles[size] || sizeStyles.md} ${className}`}
      title={`${name} (${role})`}
    >
      {initial}
    </div>
  );
}
