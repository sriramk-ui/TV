import React from 'react';
import SearchBar from './SearchBar';
import Select from '../atoms/Select';

export default function FilterControls({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions = [],
  placeholder = 'Search…',
  children,
  className = ''
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={placeholder}
        />
        {statusOptions.length > 0 && (
          <div className="min-w-[180px]">
            <Select
              value={statusValue}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
