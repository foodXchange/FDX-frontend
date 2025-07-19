import React from 'react';
import { ComponentType } from 'react';
import { EnhancedErrorBoundary, PageErrorBoundary, SectionErrorBoundary, ComponentErrorBoundary } from './EnhancedErrorBoundary';
import { ErrorBoundaryProps } from './types';

// Simplified error boundary HOCs
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary fallback={React.createElement("div", null, "Something went wrong")} {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export function withPageErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <PageErrorBoundary fallback={React.createElement("div", null, "Page error occurred")} {...errorBoundaryProps}>
      <Component {...props} />
    </PageErrorBoundary>
  );

  WrappedComponent.displayName = `withPageErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export function withSectionErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <SectionErrorBoundary fallback={React.createElement("div", null, "Section error occurred")} {...errorBoundaryProps}>
      <Component {...props} />
    </SectionErrorBoundary>
  );

  WrappedComponent.displayName = `withSectionErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export function withComponentErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary fallback={React.createElement("div", null, "Component error occurred")} {...errorBoundaryProps}>
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withComponentErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default withErrorBoundary;
