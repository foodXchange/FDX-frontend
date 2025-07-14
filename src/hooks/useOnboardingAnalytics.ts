import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { UserRole } from '../shared/types';

export interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent?: number; // in seconds
  skipped?: boolean;
  attempts?: number;
}

export interface OnboardingSession {
  id: string;
  userId: string;
  userRole: UserRole;
  startedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number;
  steps: OnboardingStep[];
  completionRate: number;
  dropOffStep?: string;
  feedback?: {
    rating: number;
    comments?: string;
    mostHelpful?: string;
    suggestions?: string;
  };
}

export interface OnboardingAnalytics {
  // Current session tracking
  currentSession: OnboardingSession | null;
  
  // Progress tracking
  completedSteps: string[];
  currentStep: string | null;
  completionRate: number;
  
  // Time tracking
  sessionStartTime: Date | null;
  stepStartTime: Date | null;
  totalTimeSpent: number;
  
  // Analytics methods
  startSession: () => void;
  startStep: (stepId: string, stepName: string) => void;
  completeStep: (stepId: string, timeSpent?: number) => void;
  skipStep: (stepId: string) => void;
  endSession: (completed: boolean) => void;
  submitFeedback: (feedback: OnboardingSession['feedback']) => void;
  
  // Analytics data
  getSessionData: () => OnboardingSession | null;
  getCompletionStats: () => {
    totalSteps: number;
    completedSteps: number;
    skippedSteps: number;
    completionRate: number;
  };
}

export const useOnboardingAnalytics = (): OnboardingAnalytics => {
  const { user } = useAppStore();
  const [currentSession, setCurrentSession] = useState<OnboardingSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [stepStartTime, setStepStartTime] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  // Load existing session from localStorage
  useEffect(() => {
    if (user) {
      const sessionKey = `onboarding_session_${user.id}`;
      const savedSession = localStorage.getItem(sessionKey);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          session.startedAt = new Date(session.startedAt);
          if (session.completedAt) {
            session.completedAt = new Date(session.completedAt);
          }
          session.steps = session.steps.map((step: any) => ({
            ...step,
            completedAt: step.completedAt ? new Date(step.completedAt) : undefined
          }));
          setCurrentSession(session);
        } catch (error) {
          console.error('Failed to load onboarding session:', error);
        }
      }
    }
  }, [user]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (currentSession && user) {
      const sessionKey = `onboarding_session_${user.id}`;
      localStorage.setItem(sessionKey, JSON.stringify(currentSession));
    }
  }, [currentSession, user]);

  const startSession = useCallback(() => {
    if (!user) return;

    const newSession: OnboardingSession = {
      id: `session_${Date.now()}`,
      userId: user.id,
      userRole: user.role,
      startedAt: new Date(),
      totalTimeSpent: 0,
      steps: [],
      completionRate: 0
    };

    setCurrentSession(newSession);
    setSessionStartTime(new Date());

    // Track session start event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_started', {
        event_category: 'onboarding',
        user_role: user.role,
        session_id: newSession.id
      });
    }
  }, [user]);

  const startStep = useCallback((stepId: string, stepName: string) => {
    if (!currentSession) return;

    setCurrentStep(stepId);
    setStepStartTime(new Date());

    // Check if step already exists
    const existingStepIndex = currentSession.steps.findIndex(s => s.id === stepId);
    
    if (existingStepIndex >= 0) {
      // Increment attempts for existing step
      const updatedSteps = [...currentSession.steps];
      updatedSteps[existingStepIndex] = {
        ...updatedSteps[existingStepIndex],
        attempts: (updatedSteps[existingStepIndex].attempts || 0) + 1
      };
      
      setCurrentSession(prev => prev ? {
        ...prev,
        steps: updatedSteps
      } : null);
    } else {
      // Add new step
      const newStep: OnboardingStep = {
        id: stepId,
        name: stepName,
        completed: false,
        attempts: 1
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        steps: [...prev.steps, newStep]
      } : null);
    }

    // Track step start event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_started', {
        event_category: 'onboarding',
        step_id: stepId,
        step_name: stepName,
        session_id: currentSession.id
      });
    }
  }, [currentSession]);

  const completeStep = useCallback((stepId: string, timeSpent?: number) => {
    if (!currentSession) return;

    const now = new Date();
    const calculatedTimeSpent = timeSpent || 
      (stepStartTime ? Math.floor((now.getTime() - stepStartTime.getTime()) / 1000) : 0);

    const updatedSteps = currentSession.steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            completed: true,
            completedAt: now,
            timeSpent: calculatedTimeSpent
          }
        : step
    );

    const completedCount = updatedSteps.filter(s => s.completed).length;
    const completionRate = updatedSteps.length > 0 ? (completedCount / updatedSteps.length) * 100 : 0;

    setCurrentSession(prev => prev ? {
      ...prev,
      steps: updatedSteps,
      completionRate,
      totalTimeSpent: prev.totalTimeSpent + calculatedTimeSpent
    } : null);

    setCurrentStep(null);
    setStepStartTime(null);

    // Track step completion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_completed', {
        event_category: 'onboarding',
        step_id: stepId,
        time_spent: calculatedTimeSpent,
        session_id: currentSession.id
      });
    }
  }, [currentSession, stepStartTime]);

  const skipStep = useCallback((stepId: string) => {
    if (!currentSession) return;

    const updatedSteps = currentSession.steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            skipped: true,
            completedAt: new Date()
          }
        : step
    );

    const completedCount = updatedSteps.filter(s => s.completed || s.skipped).length;
    const completionRate = updatedSteps.length > 0 ? (completedCount / updatedSteps.length) * 100 : 0;

    setCurrentSession(prev => prev ? {
      ...prev,
      steps: updatedSteps,
      completionRate
    } : null);

    setCurrentStep(null);
    setStepStartTime(null);

    // Track step skip event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_skipped', {
        event_category: 'onboarding',
        step_id: stepId,
        session_id: currentSession.id
      });
    }
  }, [currentSession]);

  const endSession = useCallback((completed: boolean) => {
    if (!currentSession || !sessionStartTime) return;

    const now = new Date();
    const totalSessionTime = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    
    // Find drop-off step if not completed
    const dropOffStep = !completed ? 
      currentSession.steps.find(step => !step.completed && !step.skipped)?.id : 
      undefined;

    const finalSession: OnboardingSession = {
      ...currentSession,
      completedAt: now,
      totalTimeSpent: totalSessionTime,
      dropOffStep
    };

    setCurrentSession(finalSession);
    setSessionStartTime(null);
    setStepStartTime(null);
    setCurrentStep(null);

    // Store completed session in analytics
    const analyticsKey = `onboarding_analytics_${user?.role || 'unknown'}`;
    const existingAnalytics = localStorage.getItem(analyticsKey);
    const sessions = existingAnalytics ? JSON.parse(existingAnalytics) : [];
    sessions.push(finalSession);
    localStorage.setItem(analyticsKey, JSON.stringify(sessions));

    // Track session end event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_completed', {
        event_category: 'onboarding',
        completion_rate: finalSession.completionRate,
        total_time: totalSessionTime,
        completed: completed,
        user_role: user?.role,
        session_id: finalSession.id
      });
    }
  }, [currentSession, sessionStartTime, user]);

  const submitFeedback = useCallback((feedback: OnboardingSession['feedback']) => {
    if (!currentSession) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      feedback
    } : null);

    // Track feedback event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_feedback', {
        event_category: 'onboarding',
        rating: feedback.rating,
        session_id: currentSession.id
      });
    }
  }, [currentSession]);

  const getSessionData = useCallback(() => {
    return currentSession;
  }, [currentSession]);

  const getCompletionStats = useCallback(() => {
    if (!currentSession) {
      return {
        totalSteps: 0,
        completedSteps: 0,
        skippedSteps: 0,
        completionRate: 0
      };
    }

    const totalSteps = currentSession.steps.length;
    const completedSteps = currentSession.steps.filter(s => s.completed).length;
    const skippedSteps = currentSession.steps.filter(s => s.skipped).length;
    const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      totalSteps,
      completedSteps,
      skippedSteps,
      completionRate
    };
  }, [currentSession]);

  // Derived state
  const completedSteps = currentSession?.steps.filter(s => s.completed).map(s => s.id) || [];
  const completionRate = currentSession?.completionRate || 0;
  const totalTimeSpent = currentSession?.totalTimeSpent || 0;

  return {
    currentSession,
    completedSteps,
    currentStep,
    completionRate,
    sessionStartTime,
    stepStartTime,
    totalTimeSpent,
    startSession,
    startStep,
    completeStep,
    skipStep,
    endSession,
    submitFeedback,
    getSessionData,
    getCompletionStats
  };
};

// Hook for getting aggregated analytics data
export const useOnboardingAnalyticsData = (userRole?: UserRole) => {
  const [analyticsData, setAnalyticsData] = useState<{
    sessions: OnboardingSession[];
    averageCompletionRate: number;
    averageTimeSpent: number;
    commonDropOffPoints: { stepId: string; count: number }[];
    feedbackSummary: {
      averageRating: number;
      totalResponses: number;
      commonSuggestions: string[];
    };
  } | null>(null);

  useEffect(() => {
    const loadAnalyticsData = () => {
      const analyticsKey = `onboarding_analytics_${userRole || 'unknown'}`;
      const data = localStorage.getItem(analyticsKey);
      
      if (data) {
        try {
          const sessions: OnboardingSession[] = JSON.parse(data);
          
          // Calculate averages
          const completedSessions = sessions.filter(s => s.completedAt);
          const averageCompletionRate = completedSessions.length > 0 
            ? completedSessions.reduce((sum, s) => sum + s.completionRate, 0) / completedSessions.length
            : 0;
          
          const averageTimeSpent = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.totalTimeSpent, 0) / completedSessions.length
            : 0;

          // Find common drop-off points
          const dropOffCounts: { [key: string]: number } = {};
          sessions.forEach(session => {
            if (session.dropOffStep) {
              dropOffCounts[session.dropOffStep] = (dropOffCounts[session.dropOffStep] || 0) + 1;
            }
          });
          
          const commonDropOffPoints = Object.entries(dropOffCounts)
            .map(([stepId, count]) => ({ stepId, count }))
            .sort((a, b) => b.count - a.count);

          // Aggregate feedback
          const feedbackSessions = sessions.filter(s => s.feedback);
          const averageRating = feedbackSessions.length > 0
            ? feedbackSessions.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) / feedbackSessions.length
            : 0;

          const commonSuggestions = feedbackSessions
            .map(s => s.feedback?.suggestions)
            .filter(Boolean) as string[];

          setAnalyticsData({
            sessions,
            averageCompletionRate,
            averageTimeSpent,
            commonDropOffPoints,
            feedbackSummary: {
              averageRating,
              totalResponses: feedbackSessions.length,
              commonSuggestions
            }
          });
        } catch (error) {
          console.error('Failed to load analytics data:', error);
        }
      }
    };

    loadAnalyticsData();
  }, [userRole]);

  return analyticsData;
};