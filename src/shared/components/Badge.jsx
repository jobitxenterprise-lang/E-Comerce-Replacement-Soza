import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'pending' | 'received' | 'sent' | 'invoiced' | 'cancelled' | 'soza' | 'success' | 'danger'
  size = 'md',
  className = ''
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  };

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    pending: 'bg-amber-950/70 text-amber-300 border border-amber-500/40',
    received: 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40',
    sent: 'bg-blue-950/70 text-blue-300 border border-blue-500/40',
    invoiced: 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40',
    cancelled: 'bg-red-950/70 text-red-300 border border-red-500/40',
    soza: 'bg-gradient-to-r from-blue-950 to-red-950 text-cyan-300 border border-cyan-500/50 font-bold',
    gold: 'bg-amber-950/70 text-amber-300 border border-amber-500/40',
    success: 'bg-emerald-900/40 text-emerald-300 border border-emerald-600/50',
    danger: 'bg-red-900/40 text-red-300 border border-red-600/50'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90 animate-pulse" />
      {children}
    </span>
  );
}
