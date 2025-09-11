import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  rounded = 'full',
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // Varianti di colore
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    light: 'bg-gray-50 text-gray-600',
    dark: 'bg-gray-700 text-white',
  };

  // Dimensioni
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-0.5',
    large: 'text-base px-3 py-1',
  };

  // Arrotondamento
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Composizione delle classi
  const badgeClasses = [
    'inline-flex items-center font-medium',
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.medium,
    roundedClasses[rounded] || roundedClasses.full,
    className
  ].join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {icon && iconPosition === 'left' && (
        <span className="mr-1 -ml-0.5">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-1 -mr-0.5">{icon}</span>
      )}
    </span>
  );
};

export default Badge;