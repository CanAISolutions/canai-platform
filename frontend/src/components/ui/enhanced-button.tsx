import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const enhancedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36d1fe] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1C] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] active:translate-y-0 touch-manipulation min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        default:
          'bg-[#36d1fe] text-white hover:bg-[#2bc4f0] shadow-[0_4px_14px_rgba(54,209,254,0.4)] hover:shadow-[0_8px_25px_rgba(54,209,254,0.6)] hover:scale-[1.02] hover:-translate-y-0.5',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5',
        outline:
          'border-2 border-[#36d1fe] text-[#36d1fe] bg-transparent hover:bg-[#36d1fe]/10 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg',
        secondary:
          'bg-[#1e314f] text-white border border-[#36d1fe]/30 hover:bg-[#275084] hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg',
        ghost: 'text-[#36d1fe] hover:bg-[#36d1fe]/10 hover:scale-105',
        link: 'text-[#36d1fe] underline-offset-4 hover:underline',
        primary:
          'font-bold text-white bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] ' +
          'hover:from-[#4ae3ff] hover:to-[#36d1fe] shadow-[0_4px_14px_rgba(54,209,254,0.4)] ' +
          'hover:shadow-[0_8px_25px_rgba(54,209,254,0.6)] hover:scale-[1.02] hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base font-semibold min-h-[48px]',
        xl: 'h-14 rounded-xl px-10 text-lg font-bold min-h-[48px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </Comp>
    );
  }
);
EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, enhancedButtonVariants };
