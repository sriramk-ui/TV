import React from 'react';

export default function Input({
  type = 'text',
  name,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  error = false,
  className = '',
  onChange,
  onBlur,
  ...props
}) {
  const baseStyles = 'w-full px-3.5 py-2.5 text-sm bg-white border rounded-brand-md text-ink placeholder:text-slate-400 transition-colors focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';
  const borderStyles = error
    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-slate-200 focus:border-blue focus:ring-1 focus:ring-blue';
  const readOnlyStyles = readOnly ? 'bg-slate-50 text-slate-700 cursor-default' : '';

  return (
    <input
      type={type}
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      onChange={onChange}
      onBlur={onBlur}
      className={`${baseStyles} ${borderStyles} ${readOnlyStyles} ${className}`}
      {...props}
    />
  );
}
