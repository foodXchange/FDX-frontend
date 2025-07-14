import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { routeMetadata } from '@/router/routes';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: { name: string; href: string }[] = [];

    // Always add home
    breadcrumbs.push({ name: 'Home', href: '/' });

    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if it's a parameter (starts with :)
      if (segment.startsWith(':')) {
        // Try to get actual param value
        const paramKey = segment.substring(1);
        const paramValue = params[paramKey];
        if (paramValue) {
          breadcrumbs.push({
            name: paramValue,
            href: currentPath.replace(segment, paramValue),
          });
        }
      } else {
        const metadata = routeMetadata[currentPath];
        const name = metadata?.title || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({ name, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" />
            )}
            {index === 0 ? (
              <Link
                to={breadcrumb.href}
                className="text-gray-400 hover:text-gray-500"
              >
                <HomeIcon className="flex-shrink-0 h-5 w-5" />
                <span className="sr-only">{breadcrumb.name}</span>
              </Link>
            ) : index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-700">
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                to={breadcrumb.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};