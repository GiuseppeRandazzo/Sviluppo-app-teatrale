import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({
  items = [],
  separator = '/',
  className = '',
  itemClassName = '',
  activeItemClassName = '',
  separatorClassName = '',
  ...props
}) => {
  // Se non ci sono elementi, non mostrare nulla
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb" {...props}>
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          // Classi per l'elemento corrente
          const currentItemClasses = [
            'inline-flex items-center',
            isLast ? activeItemClassName : itemClassName,
          ].join(' ');

          // Contenuto dell'elemento
          const itemContent = (
            <>
              {isFirst && (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              )}
              {item.icon && !isFirst && <span className="mr-2">{item.icon}</span>}
              <span className={isLast ? 'font-medium' : ''}>{item.label}</span>
            </>
          );

          return (
            <li key={index} className={currentItemClasses}>
              {/* Separatore (tranne per il primo elemento) */}
              {!isFirst && (
                <span className={`mx-2 text-gray-400 ${separatorClassName}`}>
                  {typeof separator === 'string' ? separator : separator}
                </span>
              )}
              
              {/* Elemento del breadcrumb */}
              {isLast || !item.href ? (
                <span className={isLast ? 'text-gray-700' : 'text-gray-500 hover:text-gray-700'}>
                  {itemContent}
                </span>
              ) : (
                <Link 
                  to={item.href} 
                  className="text-gray-500 hover:text-gray-700"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {itemContent}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;