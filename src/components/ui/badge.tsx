import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-3xl border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 transition-all duration-300 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/90 text-primary-foreground hover:bg-primary shadow-sm hover:shadow',
        secondary:
          'border-transparent bg-secondary/90 text-secondary-foreground hover:bg-secondary shadow-sm hover:shadow',
        destructive:
          'border-transparent bg-destructive/90 text-white hover:bg-destructive shadow-sm hover:shadow focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border-white/10 bg-white/5 backdrop-blur-sm text-foreground hover:bg-white/10 hover:border-white/20',
        blue: 'border-transparent bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white shadow-sm',
        indigo:
          'border-transparent bg-gradient-to-r from-indigo-500/90 to-indigo-600/90 text-white shadow-sm',
        glass:
          'border-white/10 bg-white/10 backdrop-blur-md text-white hover:bg-white/15 hover:border-white/20 shadow-sm',
      },
      size: {
        sm: 'px-2 py-0.5 text-[0.65rem]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      ref={ref}
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        '[&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:pointer-events-none',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
