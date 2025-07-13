import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes, ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-[#1E4C8A] text-white',
        success: 'bg-[#52B788] text-white',
        warning: 'bg-[#FF6B35] text-white',
        certification: 'bg-[#52B788]/10 text-[#52B788] border border-[#52B788]/20',
        safety: 'bg-[#1E4C8A]/10 text-[#1E4C8A] border border-[#1E4C8A]/20',
        premium: 'bg-[#FFD700]/10 text-[#B8860B] border border-[#FFD700]/20'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, size, icon, children, ...props }) => {
  return (
    <span className={badgeVariants({ variant, size, className })} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};