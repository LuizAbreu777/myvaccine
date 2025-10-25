import { useState, useCallback, useRef } from 'react';

interface NavigationState {
  isLoading: boolean;
  error: string | null;
}

export const useNavigationState = () => {
  const [state, setState] = useState<NavigationState>({
    isLoading: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState(prev => ({ ...prev, isLoading: loading }));

    // Auto-reset loading após 30 segundos para evitar travamentos
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      }, 30000);
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState({ isLoading: false, error: null });
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    clearError,
    reset,
  };
};
