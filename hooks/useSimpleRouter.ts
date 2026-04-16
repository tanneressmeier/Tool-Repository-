
import { useState, useEffect, useCallback } from 'react';

type Route = 'checker' | 'manager' | 'datahub' | 'kits' | 'purchasing' | 'sale-finder';

export const useSimpleRouter = () => {
  const [route, setRoute] = useState<Route>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'manager' || hash === 'datahub' || hash === 'kits' || hash === 'purchasing' || hash === 'sale-finder') {
      return hash;
    }
    return 'checker';
  });

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'manager' || hash === 'datahub' || hash === 'kits' || hash === 'purchasing' || hash === 'sale-finder') {
        setRoute(hash);
    } else {
        setRoute('checker');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);

  const navigate = (newRoute: Route) => {
    window.location.hash = newRoute;
    setRoute(newRoute);
  };

  return { route, navigate };
};
