/**
 * useAsyncState Hook
 * Manages async state with loading, error, and data states
 * @module useAsyncState
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing async operations
 * @param {Function} asyncFunction - The async function to execute
 * @returns {Object} State and execution function
 */
const useAsyncState = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return { success: true, data: result };
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

export default useAsyncState;
