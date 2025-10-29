import { NavigateFunction } from 'react-router-dom';

export const handleDeepLink = (navigate: NavigateFunction) => {
  // This will be called when native app pushes a new path
  const checkPath = () => {
    const path = window.location.pathname;
    // Navigate to the deep-linked path if needed
    if (path && path !== '/') {
      navigate(path, { replace: true });
    }
  };

  // Check on mount
  checkPath();

  // Listen for popstate (when native pushes new path)
  window.addEventListener('popstate', checkPath);

  return () => {
    window.removeEventListener('popstate', checkPath);
  };
};
