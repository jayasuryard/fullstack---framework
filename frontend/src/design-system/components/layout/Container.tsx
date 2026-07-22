import React from 'react';
import { cn } from '@/design-system/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizes = { sm: 'max-w-3xl', md: 'max-w-5xl', lg: 'max-w-7xl', xl: 'max-w-[1440px]', full: 'max-w-full' };

export function Container({ className, size = 'lg', children, ...props }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)} {...props}>
      {children}
    </div>
  );
}
