import React from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  inactiveTabClassName = '',
}) => {
  // Varianti di stile
  const variantClasses = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'py-2 px-4 text-sm font-medium',
      active: 'border-b-2 border-primary-500 text-primary-600',
      inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      container: 'flex space-x-1',
      tab: 'py-2 px-4 text-sm font-medium rounded-md',
      active: 'bg-primary-100 text-primary-700',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    },
    boxed: {
      container: 'flex',
      tab: 'py-2 px-4 text-sm font-medium first:rounded-l-md last:rounded-r-md border-y border-r first:border-l',
      active: 'bg-primary-500 text-white border-primary-500',
      inactive: 'bg-white text-gray-500 hover:text-gray-700 border-gray-300',
    },
  };

  const selectedVariant = variantClasses[variant] || variantClasses.default;

  return (
    <div className={`${selectedVariant.container} ${className}`}>
      <nav className={`flex ${fullWidth ? 'w-full' : ''}`} aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const tabClasses = [
            selectedVariant.tab,
            isActive 
              ? `${selectedVariant.active} ${activeTabClassName}` 
              : `${selectedVariant.inactive} ${inactiveTabClassName}`,
            tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            fullWidth ? 'flex-1 text-center' : '',
            tabClassName,
          ].join(' ');

          return (
            <button
              key={tab.id}
              className={tabClasses}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={tab.disabled}
              role="tab"
              aria-selected={isActive}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {tab.badge && <span className="ml-2">{tab.badge}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;