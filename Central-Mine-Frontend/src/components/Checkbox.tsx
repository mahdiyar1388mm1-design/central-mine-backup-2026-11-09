import { Check } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function Checkbox({ className = '', ...props }: CheckboxProps) {
  return (
    <span className="relative inline-flex h-5 w-5 shrink-0">
      <input
        type="checkbox"
        className={`peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition checked:border-brand-500 checked:bg-brand-500 ${className}`}
        {...props}
      />
      <Check
        size={14}
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100"
      />
    </span>
  )
}
