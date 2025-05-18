import React from 'react';

export function Avatar({ className, src, alt, children, ...props }) {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`} {...props}>
      {src ? (
        <img className="aspect-square h-full w-full" src={src} alt={alt || "Avatar"} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-600">
          {children || (
            <span className="text-sm font-medium">
              {alt ? alt.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
      )}
    </div>
  );
} 