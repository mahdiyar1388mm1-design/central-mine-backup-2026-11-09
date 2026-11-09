type StepperProps = {
  steps: string[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, index) => (
        <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
          <span
            className={
              index === currentStep
                ? 'whitespace-nowrap text-sm font-bold text-gray-900'
                : 'whitespace-nowrap text-sm text-gray-400'
            }
          >
            {label}
          </span>
          {index < steps.length - 1 && <span className="h-px flex-1 bg-gray-200" />}
        </li>
      ))}
    </ol>
  )
}
