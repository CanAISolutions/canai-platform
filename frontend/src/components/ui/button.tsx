import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-manrope touch-manipulation min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl',
        outline:
          'border-2 border-[#36d1fe] bg-transparent text-[#36d1fe] hover:bg-[#36d1fe]/10 hover:text-white hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg',
        ghost:
          'text-[#36d1fe] hover:bg-[#36d1fe]/10 hover:text-white hover:scale-105',
        link: 'text-primary underline-offset-4 hover:underline',
        canai:
          'font-bold text-white text-base px-8 py-4 rounded-xl ' +
          'bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] ' +
          'hover:from-[#4ae3ff] hover:to-[#36d1fe] ' +
          'shadow-[0_4px_14px_rgba(54,209,254,0.4)] ' +
          'hover:shadow-[0_8px_25px_rgba(54,209,254,0.6)] ' +
          'hover:scale-[1.02] hover:-translate-y-0.5 ' +
          'border border-[rgba(255,255,255,0.1)] ' +
          'backdrop-blur-sm ' +
          'transition-all duration-300 ' +
          'focus-visible:ring-2 focus-visible:ring-[#36d1fe] focus-visible:ring-offset-2 ' +
          'drop-shadow-lg active:scale-[0.98] active:translate-y-0',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-lg font-semibold min-h-[48px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
