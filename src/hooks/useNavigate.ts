import { useNavigate as useReactNavigate, NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';

interface ExtendedNavigateOptions extends NavigateOptions {
  preserveScroll?: boolean;
  withLoading?: boolean;
}

export const useNavigate = () => {
  const navigate = useReactNavigate();

  const extendedNavigate = useCallback(
    (to: string | number, options?: ExtendedNavigateOptions) => {
      if (options?.preserveScroll) {
        const scrollPosition = window.scrollY;
        navigate(to as any, options);
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition);
        });
      } else {
        navigate(to as any, options);
      }
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  const goToHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return {
    navigate: extendedNavigate,
    goBack,
    goForward,
    goToHome,
    goToLogin,
  };
};