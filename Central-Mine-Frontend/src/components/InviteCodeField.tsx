import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import TextField from './TextField'

type InviteCodeFieldProps = {
  value: string
  onChange: (value: string) => void
}

export default function InviteCodeField({ value, onChange }: InviteCodeFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-gray-700"
      >
        <span>کد دعوت (اختیاری)</span>
        <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-4">
          <TextField
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="کد دعوت"
          />
        </div>
      )}
    </div>
  )
}
