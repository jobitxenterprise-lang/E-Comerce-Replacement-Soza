import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  disabled = false,
  required = false,
  className = '',
  icon: Icon,
  helperText,
  ...props
}) {
  const hasError = Boolean(touched && error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-amber-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-slate-900/90 text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 border outline-none
            ${Icon ? 'pl-10' : ''}
            ${hasError 
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
              : 'border-slate-700/80 hover:border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
            }
            ${disabled ? 'opacity-60 bg-slate-950 cursor-not-allowed' : ''}
          `}
          {...props}
        />
      </div>

      {hasError && (
        <span className="text-xs text-rose-400 font-medium animate-fadeIn">
          {error}
        </span>
      )}

      {!hasError && helperText && (
        <span className="text-xs text-slate-400">
          {helperText}
        </span>
      )}
    </div>
  );
}
