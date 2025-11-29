import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 gap-2'
  
  const variants = {
    primary: 'bg-[#00d4aa] hover:bg-[#00f5c4] text-black',
    secondary: 'bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white border border-[#2c2c2e] hover:border-[#3a3a3c]',
    ghost: 'text-[#a1a1a6] hover:text-white hover:bg-[#1c1c1e]',
    danger: 'bg-[#ff453a] hover:bg-[#ff6961] text-white',
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-[13px]',
    md: 'px-5 py-2.5 text-[14px]',
    lg: 'px-6 py-3 text-[15px]',
  }
  
  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
