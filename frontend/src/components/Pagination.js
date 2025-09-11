import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  className = '',
  pageClassName = '',
  activePageClassName = '',
  disabledClassName = '',
  ...props
}) => {
  // Funzione per generare l'array di pagine da visualizzare
  const generatePaginationItems = () => {
    // Calcola il range di pagine da mostrare
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    
    // Se il numero totale di pagine è minore o uguale al numero totale di elementi da mostrare
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calcola gli indici di inizio e fine per i siblings
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Non mostrare i puntini se c'è solo una pagina di differenza
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Caso 1: mostra i puntini a destra
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      
      return [...leftRange, '...', totalPages];
    }
    
    // Caso 2: mostra i puntini a sinistra
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      
      return [1, '...', ...rightRange];
    }
    
    // Caso 3: mostra i puntini sia a sinistra che a destra
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      
      return [1, '...', ...middleRange, '...', totalPages];
    }
  };

  const pages = generatePaginationItems();
  
  if (!pages || pages.length <= 1) return null;

  return (
    <nav className={`flex justify-center mt-4 ${className}`} aria-label="Pagination" {...props}>
      <ul className="inline-flex items-center -space-x-px">
        {/* Pulsante Prima pagina */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`
                block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg
                ${currentPage === 1 ? `cursor-not-allowed ${disabledClassName}` : 'hover:bg-gray-100 hover:text-gray-700'}
              `}
              aria-label="Prima pagina"
            >
              <span className="sr-only">Prima pagina</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        )}
        
        {/* Pulsante Pagina precedente */}
        {showPrevNext && (
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300
                ${!showFirstLast ? 'rounded-l-lg' : ''}
                ${currentPage === 1 ? `cursor-not-allowed ${disabledClassName}` : 'hover:bg-gray-100 hover:text-gray-700'}
              `}
              aria-label="Pagina precedente"
            >
              <span className="sr-only">Pagina precedente</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        )}
        
        {/* Numeri di pagina */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  ...
                </span>
              </li>
            );
          }
          
          return (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={`
                  block px-3 py-2 leading-tight border border-gray-300
                  ${currentPage === page 
                    ? `text-primary-600 bg-primary-50 border-primary-300 ${activePageClassName}` 
                    : `text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 ${pageClassName}`
                  }
                `}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          );
        })}
        
        {/* Pulsante Pagina successiva */}
        {showPrevNext && (
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300
                ${!showFirstLast ? 'rounded-r-lg' : ''}
                ${currentPage === totalPages ? `cursor-not-allowed ${disabledClassName}` : 'hover:bg-gray-100 hover:text-gray-700'}
              `}
              aria-label="Pagina successiva"
            >
              <span className="sr-only">Pagina successiva</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        )}
        
        {/* Pulsante Ultima pagina */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`
                block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg
                ${currentPage === totalPages ? `cursor-not-allowed ${disabledClassName}` : 'hover:bg-gray-100 hover:text-gray-700'}
              `}
              aria-label="Ultima pagina"
            >
              <span className="sr-only">Ultima pagina</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;