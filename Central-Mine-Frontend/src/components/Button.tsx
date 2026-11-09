import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ className = '', disabled, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full rounded-2xl py-4 text-base font-bold transition ${
        disabled
          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
          : 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
      } ${className}`}
      {...props}
    />
  )
}
