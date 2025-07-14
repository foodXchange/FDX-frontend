// Main onboarding components
export { OnboardingTour, WelcomeModal, OnboardingChecklist } from './OnboardingTour';
export type { TourStep } from './OnboardingTour';

// Role-specific onboarding tours
export { SellerOnboardingTour, useSellerOnboarding } from './SellerOnboardingTour';
export { BuyerOnboardingTour, useBuyerOnboarding } from './BuyerOnboardingTour';

// Interactive demo components
export {
  AIChatDemo,
  MarketDataDemo,
  SupplierMatchDemo,
  ComplianceDemo,
  OrderTrackingDemo,
  DemoShowcase
} from './InteractiveDemoComponents';

// Onboarding management and routing
export {
  OnboardingManager,
  OnboardingFloatingButton,
  useOnboardingManager
} from './OnboardingManager';

// Analytics and tracking
export { useOnboardingAnalytics, useOnboardingAnalyticsData } from '../hooks/useOnboardingAnalytics';
export type { OnboardingStep, OnboardingSession, OnboardingAnalytics } from '../hooks/useOnboardingAnalytics';