import React from 'react';

const Loader = ({ size = 'medium', text = '', fullScreen = false }) => {
  // Determina le dimensioni in base al parametro size
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-6 w-6 border-2';
      case 'large':
        return 'h-16 w-16 border-4';
      case 'medium':
      default:
        return 'h-10 w-10 border-3';
    }
  };

  const sizeClasses = getSizeClasses();

  // Componente di base del loader
  const loaderElement = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClasses} border-t-transparent border-primary-500`}></div>
      {text && <p className="mt-3 text-gray-600 text-sm">{text}</p>}
    </div>
  );

  // Se fullScreen è true, centra il loader a schermo intero
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {loaderElement}
      </div>
    );
  }

  // Altrimenti, restituisci solo il loader
  return loaderElement;
};

export default Loader;