import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-deep text-white font-extrabold text-2xl shadow-xl shadow-deep/20 mb-4">
          S
        </div>
        <h2 className="text-2xl font-extrabold text-deep tracking-tight">
          Sri Sankara TV
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
          Broadcast Production Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-brand border border-slate-200/80 rounded-brand sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
