interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'success' | 'warning'
  className?: string
}

const variants = {
  default: 'bg-brand-100 text-brand-800',
  outline: 'border border-gray-300 text-gray-700',
  success: 'bg-field-100 text-field-800',
  warning: 'bg-amber-100 text-amber-800',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
