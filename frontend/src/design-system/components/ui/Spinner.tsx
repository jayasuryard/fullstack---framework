import React from 'react';
import { cn } from '@/design-system/utils';
import { Loader2 } from 'lucide-react';

const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6', xl: 'h-8 w-8' };

interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  size?: keyof typeof sizes;
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ className, size = 'md', ...props }, ref) => {
  return <Loader2 ref={ref} className={cn('animate-spin text-neutral-400', sizes[size], className)} {...props} />;
});
Spinner.displayName = 'Spinner';
