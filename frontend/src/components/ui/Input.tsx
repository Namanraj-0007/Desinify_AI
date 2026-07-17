import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 outline-none focus:border-indigo-500 ${className}`}
      {...props}
    />
  )
}

