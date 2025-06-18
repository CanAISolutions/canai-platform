import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const standardButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium font-manrope transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] text-white shadow-[0_4px_14px_rgba(54,209,254,0.4)] ' +
          'hover:from-[#4ae3ff] hover:to-[#36d1fe] hover:shadow-[0_8px_25px_rgba(54,209,254,0.6)] hover:scale-[1.02] hover:-translate-y-0.5 ' +
          'focus-visible:ring-[#36d1fe]/50',
        secondary:
          'bg-[rgba(25,60,101,0.7)] border-2 border-[#36d1fe] text-white backdrop-blur-md ' +
          'hover:bg-[rgba(54,209,254,0.1)] hover:border-[#4ae3ff] hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ' +
          'focus-visible:ring-[#36d1fe]/50',
        outline:
          'border-2 border-[#36d1fe] text-[#36d1fe] bg-transparent ' +
          'hover:bg-[rgba(54,209,254,0.1)] hover:text-white hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ' +
          'focus-visible:ring-[#36d1fe]/50',
        ghost:
          'text-[#36d1fe] bg-transparent ' +
          'hover:bg-[rgba(54,209,254,0.1)] hover:text-white hover:scale-105 ' +
          'focus-visible:ring-[#36d1fe]/50',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white ' +
          'hover:from-red-600 hover:to-red-700 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl ' +
          'focus-visible:ring-red-500/50',
        success:
          'bg-gradient-to-r from-green-500 to-green-600 text-white ' +
          'hover:from-green-600 hover:to-green-700 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl ' +
          'focus-visible:ring-green-500/50',
        link: 'text-[#36d1fe] underline-offset-4 hover:underline p-0',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-12 px-6 text-base min-h-[48px]',
        lg: 'h-14 px-8 text-lg min-h-[48px]',
        xl: 'h-16 px-10 text-xl min-h-[48px]',
        icon: 'h-10 w-10',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      loading: false,
    },
  }
);

export interface StandardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof standardButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const StandardButton = React.forwardRef<HTMLButtonElement, StandardButtonProps>(
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

    const content = loading ? (
      <>
        <Loader2 className="animate-spin" />
        {loadingText || children}
      </>
    ) : (
      <>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </>
    );

    return (
      <Comp
        className={cn(
          standardButtonVariants({ variant, size, loading, className })
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);
StandardButton.displayName = 'StandardButton';

export { StandardButton, standardButtonVariants };
