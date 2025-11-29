import React from 'react'

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  label?: string
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-medium text-[#a1a1a6] mb-3 uppercase tracking-wide">
          {label}
          {required && <span className="text-[#ff453a] ml-1">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
              ${value === option.value
                ? 'bg-[rgba(0,212,170,0.15)] border-[#00d4aa] text-[#00d4aa]'
                : 'bg-[#1c1c1e] border-[#2c2c2e] text-[#a1a1a6] hover:border-[#3a3a3c] hover:text-white'
              }
              border
            `}
          >
            <div className={`
              w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
              ${value === option.value
                ? 'border-[#00d4aa]'
                : 'border-[#6e6e73]'
              }
            `}>
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
              )}
            </div>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              className="sr-only"
            />
            <span className="text-[14px] font-medium">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-[13px] text-[#ff453a]">{error}</p>
      )}
    </div>
  )
}
