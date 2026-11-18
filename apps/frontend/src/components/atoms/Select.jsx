import React from 'react';

export default function Select({
  name,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error = false,
  children,
  className = '',
  onChange,
  onBlur,
  ...props
}) {
  const baseStyles = 'w-full px-3.5 py-2.5 text-sm bg-white border rounded-brand-md text-ink transition-colors focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.6rem_center] bg-no-repeat pr-9';
  const borderStyles = error
    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-slate-200 focus:border-blue focus:ring-1 focus:ring-blue';

  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      required={required}
      onChange={onChange}
      onBlur={onBlur}
      className={`${baseStyles} ${borderStyles} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
