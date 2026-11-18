import React from 'react';

export default function Textarea({
  name,
  value,
  defaultValue,
  placeholder,
  rows = 3,
  disabled = false,
  readOnly = false,
  required = false,
  error = false,
  className = '',
  onChange,
  onBlur,
  ...props
}) {
  const baseStyles = 'w-full px-3.5 py-2.5 text-sm bg-white border rounded-brand-md text-ink placeholder:text-slate-400 transition-colors focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed resize-y';
  const borderStyles = error
    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-slate-200 focus:border-blue focus:ring-1 focus:ring-blue';

  return (
    <textarea
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      onChange={onChange}
      onBlur={onBlur}
      className={`${baseStyles} ${borderStyles} ${className}`}
      {...props}
    />
  );
}
