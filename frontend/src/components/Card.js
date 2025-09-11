import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  noPadding = false,
  bordered = true,
  shadow = 'md',
  ...props
}) => {
  // Classi per le ombre
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Composizione delle classi di base per la card
  const cardClasses = [
    'bg-white rounded-xl overflow-hidden',
    bordered ? 'border border-gray-200' : '',
    shadowClasses[shadow] || shadowClasses.md,
    className
  ].join(' ');

  // Classi per il corpo della card
  const bodyClasses = [
    noPadding ? '' : 'p-6',
    bodyClassName
  ].join(' ');

  return (
    <div className={cardClasses} {...props}>
      {/* Header della card (opzionale) */}
      {(title || subtitle) && (
        <div className={`border-b border-gray-200 ${noPadding ? '' : 'px-6 py-4'} ${headerClassName}`}>
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      {/* Corpo della card */}
      <div className={bodyClasses}>
        {children}
      </div>
      
      {/* Footer della card (opzionale) */}
      {footer && (
        <div className={`border-t border-gray-200 ${noPadding ? '' : 'px-6 py-4'} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;