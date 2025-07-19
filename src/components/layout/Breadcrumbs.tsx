import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Box, Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
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
    pathnames.forEach((segment) => {
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
    <Box component="nav" aria-label="Breadcrumb">
      <MuiBreadcrumbs 
        separator={<Box component={ChevronRightIcon} sx={{ width: 16, height: 16, color: 'text.secondary' }} />}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        {breadcrumbs.map((breadcrumb, index) => (
          <Box key={breadcrumb.href}>
            {index === 0 ? (
              <Box component={Link}
                to={breadcrumb.href}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                  <Box component={HomeIcon} sx={{ flexShrink: 0, width: 20, height: 20 }} />
                  <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>{breadcrumb.name}</Box>
                </Box>
              </Box>
            ) : index === breadcrumbs.length - 1 ? (
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                {breadcrumb.name}
              </Typography>
            ) : (
              <Box component={Link}
                to={breadcrumb.href}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                  {breadcrumb.name}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </MuiBreadcrumbs>
    </Box>
  );
};