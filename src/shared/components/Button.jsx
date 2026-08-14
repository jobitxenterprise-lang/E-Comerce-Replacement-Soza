import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'soza', // 'soza' | 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5'
  };

  const variantStyles = {
    soza: 'bg-gradient-to-r from-cyan-500 via-blue-600 to-red-600 hover:from-cyan-400 hover:via-blue-500 hover:to-red-500 text-white shadow-lg shadow-blue-900/40 active:scale-[0.98]',
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/50 active:scale-[0.98]',
    secondary: 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-cyan-950/40 text-cyan-400 border border-cyan-500/50 hover:border-cyan-400 active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/50 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
    gold: 'bg-gradient-to-r from-cyan-500 via-blue-600 to-red-600 hover:from-cyan-400 hover:via-blue-500 hover:to-red-500 text-white shadow-lg shadow-blue-900/40 active:scale-[0.98]'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.soza} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
