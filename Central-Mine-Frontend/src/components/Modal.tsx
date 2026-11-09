import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** پاپ‌آپ عمومی وسط صفحه — بک‌دراپ/دکمه‌ی ضربدر/کلید Esc همه می‌بندنش. */
export default function Modal({ open, onClose, title, children }: ModalProps) {
  // Esc بستن — فقط وقتی باز است listener رو وصل می‌کنیم.
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          {title && <h2 className="text-base font-bold text-gray-900">{title}</h2>}
          <button
            type="button"
            aria-label="بستن"
            onClick={onClose}
            className="mr-auto text-gray-400 transition hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600">{children}</div>
      </div>
    </div>
  )
}
