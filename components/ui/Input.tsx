import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-medium text-[#a1a1a6] mb-2 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-[#ff453a] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3.5 
            bg-[#1c1c1e] 
            border border-[#2c2c2e] 
            rounded-xl 
            text-white text-[15px]
            placeholder-[#6e6e73]
            transition-all duration-200
            hover:border-[#3a3a3c]
            focus:border-[#00d4aa] focus:bg-[#141414] focus:ring-4 focus:ring-[rgba(0,212,170,0.15)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[#ff453a] focus:border-[#ff453a] focus:ring-[rgba(255,69,58,0.15)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[13px] text-[#ff453a] flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-[13px] text-[#6e6e73]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
