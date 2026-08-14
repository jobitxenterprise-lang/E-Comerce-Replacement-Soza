import React from 'react';

export default function Select({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [], // [{ value, label, disabled }]
  placeholder = 'Selecciona una opción...',
  error,
  touched,
  disabled = false,
  required = false,
  className = '',
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

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full bg-slate-900/90 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 border outline-none cursor-pointer
          ${hasError 
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
            : 'border-slate-700/80 hover:border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
          }
          ${disabled ? 'opacity-60 bg-slate-950 cursor-not-allowed' : ''}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {placeholder}
          </option>
        )}
        {options.map((opt, i) => (
          <option
            key={opt.value ?? i}
            value={opt.value}
            disabled={opt.disabled}
            className="bg-slate-900 text-slate-100"
          >
            {opt.label}
          </option>
        ))}
      </select>

      {hasError && (
        <span className="text-xs text-rose-400 font-medium">
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
