// Dynamic import utilities for better code splitting
export const createDynamicImport = (path: string) => () => import(path);

// Commonly used dynamic imports
export const dynamicImports = {
  // Pages
  Dashboard: createDynamicImport('../pages/Dashboard'),
  RFQList: createDynamicImport('../features/rfqs/pages/RFQList'),
  RFQCreate: createDynamicImport('../features/rfqs/pages/RFQCreate'),
  SupplierList: createDynamicImport('../features/suppliers/pages/SupplierList'),
  OrderList: createDynamicImport('../features/orders/pages/OrderList'),
  
  // Components
  DataTable: createDynamicImport('../components/ui/DataTable'),
  Chart: createDynamicImport('../components/ui/Chart'),
  Map: createDynamicImport('../components/ui/Map'),
  
  // Features
  ExpertMarketplace: createDynamicImport('../features/expert-marketplace'),
  Analytics: createDynamicImport('../features/analytics'),
  Compliance: createDynamicImport('../features/compliance'),
};

// Tree shaking helpers
export const treeShakingHelpers = {
  // Only import specific Material-UI components
  muiImports: {
    Button: () => import('@mui/material/Button'),
    TextField: () => import('@mui/material/TextField'),
    DataGrid: () => import('@mui/x-data-grid/DataGrid'),
    DatePicker: () => import('@mui/x-date-pickers/DatePicker'),
  },
  
  // Only import specific Heroicons
  iconImports: {
    PlusIcon: () => import('@heroicons/react/24/outline').then(mod => ({ default: mod.PlusIcon })),
    EditIcon: () => import('@heroicons/react/24/outline').then(mod => ({ default: mod.PencilIcon })),
    DeleteIcon: () => import('@heroicons/react/24/outline').then(mod => ({ default: mod.TrashIcon })),
  },
};

// Bundle analyzer utilities
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.group('Bundle Analysis');
    
    // Estimate component bundle sizes
    const components = {
      'React': require('react'),
      'ReactDOM': require('react-dom'),
      'Material-UI': require('@mui/material'),
      'React Router': require('react-router-dom'),
      'React Query': require('@tanstack/react-query'),
    };
    
    Object.entries(components).forEach(([name, module]) => {
      const size = JSON.stringify(module).length;
      console.log(`${name}: ~${(size / 1024).toFixed(2)}KB`);
    });
    
    console.groupEnd();
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/static/css/main.css',
    '/static/js/main.js',
    '/favicon.ico',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Resource hints for better loading
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
    { rel: 'preconnect', href: 'https://api.foodxchange.com' },
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
}

// Code splitting strategy
export const codeSplittingStrategy = {
  // Split by route
  routeBased: {
    '/dashboard': dynamicImports.Dashboard,
    '/rfqs': dynamicImports.RFQList,
    '/rfqs/create': dynamicImports.RFQCreate,
    '/suppliers': dynamicImports.SupplierList,
    '/orders': dynamicImports.OrderList,
  },
  
  // Split by feature
  featureBased: {
    expertMarketplace: dynamicImports.ExpertMarketplace,
    analytics: dynamicImports.Analytics,
    compliance: dynamicImports.Compliance,
  },
  
  // Split by component size
  componentBased: {
    heavy: {
      DataTable: dynamicImports.DataTable,
      Chart: dynamicImports.Chart,
      Map: dynamicImports.Map,
    },
    light: {
      // Keep small components in main bundle
    },
  },
};

// Webpack chunk optimization
export function optimizeChunks() {
  return {
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5,
        enforce: true,
      },
      styles: {
        name: 'styles',
        test: /\.css$/,
        chunks: 'all',
        enforce: true,
      },
    },
  };
}