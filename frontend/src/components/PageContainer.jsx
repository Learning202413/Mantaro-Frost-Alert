import React from 'react';

export default function PageContainer({
  title,
  subtitle,
  actions,
  children
}) {
  return (
    <div className="flex-1 p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full text-left">
      {/* Page Title & Actions Header */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200">
          <div>
            {title && (
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Page Content */}
      <div>{children}</div>
    </div>
  );
}
