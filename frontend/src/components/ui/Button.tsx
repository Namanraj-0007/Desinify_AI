import React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'bg-white text-slate-950 hover:bg-white/90'
      : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'

  return <button className={`${base} ${styles} ${className}`} {...props} />
}

