import React from 'react';

type BadgeVariant = 'blush' | 'green' | 'blue' | 'gray' | 'red' | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  blush: 'bg-blush-100 text-blush-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-600',
  gold: 'bg-champagne-300/30 text-champagne-600',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
}
