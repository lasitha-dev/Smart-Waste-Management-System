/**
 * useFormSubmit Hook
 * Handles form submission with loading and error states
 * @module useFormSubmit
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for handling form submissions
 * @param {Function} submitFunction - The function to call on submit
 * @param {Function} onSuccess - Callback on successful submission
 * @param {Function} onError - Callback on error
 * @returns {Object} Submit handler and state
 */
const useFormSubmit = (submitFunction, onSuccess, onError) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = useCallback(
    async (formData) => {
      if (submitting) {
        return { success: false, error: 'Submission already in progress' };
      }

      setSubmitting(true);
      setSubmitError(null);

      try {
        const result = await submitFunction(formData);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return { success: true, data: result };
      } catch (err) {
        const errorMessage = err.message || 'Submission failed';
        setSubmitError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        return { success: false, error: errorMessage };
      } finally {
        setSubmitting(false);
      }
    },
    [submitFunction, onSuccess, onError, submitting]
  );

  const resetSubmit = useCallback(() => {
    setSubmitError(null);
    setSubmitting(false);
  }, []);

  return {
    handleSubmit,
    submitting,
    submitError,
    resetSubmit,
  };
};

export default useFormSubmit;
