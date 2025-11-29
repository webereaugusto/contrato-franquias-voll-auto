import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-[#ff453a] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3.5 
              bg-[#1c1c1e] 
              border border-[#2c2c2e] 
              rounded-xl 
              text-white text-[15px]
              transition-all duration-200
              hover:border-[#3a3a3c]
              focus:border-[#00d4aa] focus:bg-[#141414] focus:ring-4 focus:ring-[rgba(0,212,170,0.15)]
              appearance-none cursor-pointer
              ${error ? 'border-[#ff453a]' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1c1c1e]">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-[13px] text-[#ff453a]">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
