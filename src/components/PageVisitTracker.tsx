import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageVisitTracker } from '@/hooks/usePageVisitTracker';

/**
 * Invisible component that tracks page visits via route changes.
 * Place inside BrowserRouter.
 */
export default function PageVisitTracker() {
  const location = useLocation();
  const { trackPageVisit } = usePageVisitTracker();

  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname, trackPageVisit]);

  return null;
}
