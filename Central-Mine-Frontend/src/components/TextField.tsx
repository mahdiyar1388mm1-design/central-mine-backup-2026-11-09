import { forwardRef, type InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { error, className = '', ...props },
  ref,
) {
  const hasError = Boolean(error)

  return (
    <div>
      <input
        ref={ref}
        className={`w-full rounded-2xl border-2 bg-white px-5 py-4 text-right text-base text-gray-900 outline-none transition placeholder:text-gray-400 ${
          hasError ? 'border-brand-500' : 'border-gray-200 focus:border-brand-500'
        } ${className}`}
        {...props}
      />
      {hasError && <p className="mt-2 text-right text-sm text-red-500">{error}</p>}
    </div>
  )
})

export default TextField
