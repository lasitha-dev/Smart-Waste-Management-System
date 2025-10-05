/**
 * Async State Hook
 * Custom hook for managing async operations with loading states
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module useAsyncState
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToastManager } from '../components/Toast';

/**
 * Hook for managing async operations with loading, error, and success states
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showSuccessToast - Show success toast
 * @param {boolean} options.showErrorToast - Show error toast
 * @param {string} options.successMessage - Custom success message
 * @param {string} options.errorMessage - Custom error message
 * @param {number} options.timeout - Operation timeout in ms
 */
export const useAsyncState = (options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
    timeout = 30000
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(async (asyncFunction, ...args) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Operation timed out'));
        }, timeout);
      });

      // Execute the async function
      const result = await Promise.race([
        asyncFunction(...args),
        timeoutPromise
      ]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!mountedRef.current) return;

      setData(result);
      setLastUpdated(new Date());

      // Handle success
      if (onSuccess) {
        onSuccess(result);
      }

      if (showSuccessToast) {
        ToastManager.success(successMessage);
      }

      return result;

    } catch (err) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!mountedRef.current) return;

      const errorObj = {
        message: err.message || errorMessage,
        code: err.code || 'UNKNOWN_ERROR',
        details: err.details || null,
        timestamp: new Date()
      };

      setError(errorObj);

      // Handle error
      if (onError) {
        onError(errorObj);
      }

      if (showErrorToast) {
        ToastManager.error(errorObj.message);
      }

      throw errorObj;

    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    onSuccess,
    onError,
    showSuccessToast,
    showErrorToast,
    successMessage,
    errorMessage,
    timeout
  ]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setLastUpdated(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const retry = useCallback((asyncFunction, ...args) => {
    return execute(asyncFunction, ...args);
  }, [execute]);

  return {
    loading,
    error,
    data,
    lastUpdated,
    execute,
    reset,
    retry,
    isStale: lastUpdated && (Date.now() - lastUpdated.getTime()) > 300000 // 5 minutes
  };
};

/**
 * Hook for managing form submission with validation and feedback
 */
export const useFormSubmission = (options = {}) => {
  const {
    validate,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Form submitted successfully',
    errorMessage = 'Please check your input and try again',
    resetOnSuccess = false
  } = options;

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitCount, setSubmitCount] = useState(0);

  const submitForm = useCallback(async (formData, submitFunction) => {
    try {
      setSubmitting(true);
      setSubmitCount(prev => prev + 1);

      // Run validation if provided
      if (validate) {
        const validationErrors = await validate(formData);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          
          if (showErrorToast) {
            const firstError = Object.values(validationErrors)[0];
            ToastManager.error(firstError);
          }
          
          return false;
        }
      }

      // Clear errors
      setErrors({});

      // Execute submission
      const result = await submitFunction(formData);

      // Handle success
      if (onSuccess) {
        onSuccess(result);
      }

      if (showSuccessToast) {
        ToastManager.success(successMessage);
      }

      if (resetOnSuccess) {
        setTouched({});
        setErrors({});
      }

      return result;

    } catch (err) {
      const errorObj = {
        message: err.message || errorMessage,
        code: err.code || 'SUBMISSION_ERROR',
        details: err.details || null
      };

      setErrors({ _form: errorObj.message });

      if (onError) {
        onError(errorObj);
      }

      if (showErrorToast) {
        ToastManager.error(errorObj.message);
      }

      throw errorObj;

    } finally {
      setSubmitting(false);
    }
  }, [
    validate,
    onSuccess,
    onError,
    showSuccessToast,
    showErrorToast,
    successMessage,
    errorMessage,
    resetOnSuccess
  ]);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setSubmitting(false);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, []);

  return {
    submitting,
    errors,
    touched,
    submitCount,
    submitForm,
    setFieldError,
    setFieldTouched,
    clearErrors,
    resetForm,
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Hook for managing pagination with loading states
 */
export const usePagination = (fetchFunction, options = {}) => {
  const {
    pageSize = 10,
    initialPage = 1,
    showErrorToast = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadPage = useCallback(async (page, isRefresh = false, isLoadMore = false) => {
    try {
      if (!isRefresh && !isLoadMore) {
        setLoading(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      }

      setError(null);

      const result = await fetchFunction({
        page,
        pageSize,
        offset: (page - 1) * pageSize
      });

      const newData = result.data || [];
      const total = result.total || 0;

      if (isRefresh || page === 1) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }

      setCurrentPage(page);
      setTotalCount(total);
      setHasNextPage(newData.length === pageSize && data.length + newData.length < total);

    } catch (err) {
      const errorObj = {
        message: err.message || 'Failed to load data',
        code: err.code || 'LOAD_ERROR'
      };

      setError(errorObj);

      if (showErrorToast) {
        ToastManager.error(errorObj.message);
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [fetchFunction, pageSize, data.length]);

  const refresh = useCallback(() => {
    return loadPage(1, true);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      return loadPage(currentPage + 1, false, true);
    }
  }, [loadPage, currentPage, hasNextPage, loadingMore]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setHasNextPage(true);
    setTotalCount(0);
    setError(null);
  }, [initialPage]);

  // Initial load
  useEffect(() => {
    loadPage(initialPage);
  }, []);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    error,
    currentPage,
    hasNextPage,
    totalCount,
    refresh,
    loadMore,
    reset,
    isEmpty: !loading && data.length === 0,
    isLastPage: !hasNextPage
  };
};

/**
 * Hook for managing optimistic updates
 */
export const useOptimisticUpdate = () => {
  const [optimisticData, setOptimisticData] = useState(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const performOptimisticUpdate = useCallback(async (
    optimisticValue,
    actualUpdate,
    onSuccess,
    onError
  ) => {
    try {
      // Apply optimistic update
      setOptimisticData(optimisticValue);
      setIsOptimistic(true);

      // Perform actual update
      const result = await actualUpdate();

      // Update with actual result
      setOptimisticData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (err) {
      // Revert optimistic update
      setOptimisticData(null);
      
      if (onError) {
        onError(err);
      }

      throw err;

    } finally {
      setIsOptimistic(false);
    }
  }, []);

  const clearOptimistic = useCallback(() => {
    setOptimisticData(null);
    setIsOptimistic(false);
  }, []);

  return {
    optimisticData,
    isOptimistic,
    performOptimisticUpdate,
    clearOptimistic
  };
};

export default useAsyncState;
