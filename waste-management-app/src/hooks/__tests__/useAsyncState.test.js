/**
 * useAsyncState Hook Tests
 * Comprehensive unit tests for async state management hooks
 * 
 * @author Kumarasinghe S.S (IT22221414)
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { 
  useAsyncState, 
  useFormSubmission, 
  usePagination, 
  useOptimisticUpdate 
} from '../hooks/useAsyncState';
import { ToastManager } from '../components/Toast';

// Mock ToastManager
jest.mock('../components/Toast', () => ({
  ToastManager: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

describe('useAsyncState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useAsyncState());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe(null);
      expect(result.current.lastUpdated).toBe(null);
      expect(result.current.isStale).toBe(false);
    });

    it('provides execute, reset, and retry functions', () => {
      const { result } = renderHook(() => useAsyncState());
      
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.retry).toBe('function');
    });
  });

  describe('Successful Execution', () => {
    it('handles successful async operation', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('success data');
      const onSuccessMock = jest.fn();
      
      const { result } = renderHook(() => 
        useAsyncState({ onSuccess: onSuccessMock })
      );
      
      await act(async () => {
        await result.current.execute(mockAsyncFunction);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe('success data');
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
      expect(onSuccessMock).toHaveBeenCalledWith('success data');
    });

    it('shows success toast when showSuccessToast is true', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('data');
      
      const { result } = renderHook(() => 
        useAsyncState({ 
          showSuccessToast: true,
          successMessage: 'Operation successful'
        })
      );
      
      await act(async () => {
        await result.current.execute(mockAsyncFunction);
      });
      
      expect(ToastManager.success).toHaveBeenCalledWith('Operation successful');
    });

    it('sets loading state during execution', async () => {
      let resolvePromise;
      const mockAsyncFunction = jest.fn(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );
      
      const { result } = renderHook(() => useAsyncState());
      
      act(() => {
        result.current.execute(mockAsyncFunction);
      });
      
      expect(result.current.loading).toBe(true);
      
      await act(async () => {
        resolvePromise('data');
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles async operation errors', async () => {
      const error = new Error('Test error');
      const mockAsyncFunction = jest.fn().mockRejectedValue(error);
      const onErrorMock = jest.fn();
      
      const { result } = renderHook(() => 
        useAsyncState({ onError: onErrorMock })
      );
      
      await act(async () => {
        try {
          await result.current.execute(mockAsyncFunction);
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toMatchObject({
        message: 'Test error',
        code: 'UNKNOWN_ERROR'
      });
      expect(result.current.data).toBe(null);
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('shows error toast when showErrorToast is true', async () => {
      const mockAsyncFunction = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const { result } = renderHook(() => 
        useAsyncState({ showErrorToast: true })
      );
      
      await act(async () => {
        try {
          await result.current.execute(mockAsyncFunction);
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(ToastManager.error).toHaveBeenCalledWith('Test error');
    });

    it('uses custom error message', async () => {
      const mockAsyncFunction = jest.fn().mockRejectedValue(new Error('Original error'));
      
      const { result } = renderHook(() => 
        useAsyncState({ 
          showErrorToast: true,
          errorMessage: 'Custom error message'
        })
      );
      
      await act(async () => {
        try {
          await result.current.execute(mockAsyncFunction);
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error.message).toBe('Original error');
    });
  });

  describe('Timeout Handling', () => {
    it('handles timeout errors', async () => {
      const mockAsyncFunction = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );
      
      const { result } = renderHook(() => 
        useAsyncState({ timeout: 1000 })
      );
      
      await act(async () => {
        try {
          result.current.execute(mockAsyncFunction);
          jest.advanceTimersByTime(1500);
        } catch (e) {
          // Expected to throw timeout error
        }
      });
      
      await waitFor(() => {
        expect(result.current.error?.message).toBe('Operation timed out');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('resets state correctly', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('data');
      
      const { result } = renderHook(() => useAsyncState());
      
      // Execute to set some state
      await act(async () => {
        await result.current.execute(mockAsyncFunction);
      });
      
      expect(result.current.data).toBe('data');
      
      // Reset state
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe(null);
      expect(result.current.lastUpdated).toBe(null);
    });
  });

  describe('Retry Functionality', () => {
    it('retries failed operations', async () => {
      const mockAsyncFunction = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success on retry');
      
      const { result } = renderHook(() => useAsyncState());
      
      // First attempt fails
      await act(async () => {
        try {
          await result.current.execute(mockAsyncFunction);
        } catch (e) {
          // Expected to fail
        }
      });
      
      expect(result.current.error).toBeTruthy();
      
      // Retry succeeds
      await act(async () => {
        await result.current.retry(mockAsyncFunction);
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe('success on retry');
    });
  });

  describe('Stale Data Detection', () => {
    it('detects stale data after 5 minutes', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('data');
      
      const { result } = renderHook(() => useAsyncState());
      
      await act(async () => {
        await result.current.execute(mockAsyncFunction);
      });
      
      expect(result.current.isStale).toBe(false);
      
      // Mock time passage (5+ minutes)
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 300001); // 5 minutes + 1ms
      
      expect(result.current.isStale).toBe(true);
      
      Date.now = originalDateNow;
    });
  });
});

describe('useFormSubmission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useFormSubmission());
      
      expect(result.current.submitting).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.submitCount).toBe(0);
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('handles successful form submission', async () => {
      const mockSubmitFunction = jest.fn().mockResolvedValue('success');
      const onSuccessMock = jest.fn();
      
      const { result } = renderHook(() => 
        useFormSubmission({ onSuccess: onSuccessMock })
      );
      
      const formData = { name: 'test' };
      
      await act(async () => {
        const response = await result.current.submitForm(formData, mockSubmitFunction);
        expect(response).toBe('success');
      });
      
      expect(result.current.submitting).toBe(false);
      expect(result.current.submitCount).toBe(1);
      expect(onSuccessMock).toHaveBeenCalledWith('success');
    });

    it('handles form submission errors', async () => {
      const error = new Error('Submission failed');
      const mockSubmitFunction = jest.fn().mockRejectedValue(error);
      const onErrorMock = jest.fn();
      
      const { result } = renderHook(() => 
        useFormSubmission({ onError: onErrorMock })
      );
      
      await act(async () => {
        try {
          await result.current.submitForm({}, mockSubmitFunction);
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.submitting).toBe(false);
      expect(result.current.errors._form).toBe('Submission failed');
      expect(result.current.hasErrors).toBe(true);
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('runs validation before submission', async () => {
      const mockValidate = jest.fn().mockResolvedValue({ name: 'Name is required' });
      const mockSubmitFunction = jest.fn();
      
      const { result } = renderHook(() => 
        useFormSubmission({ validate: mockValidate })
      );
      
      await act(async () => {
        const response = await result.current.submitForm({}, mockSubmitFunction);
        expect(response).toBe(false);
      });
      
      expect(result.current.errors.name).toBe('Name is required');
      expect(mockSubmitFunction).not.toHaveBeenCalled();
    });
  });

  describe('Field Management', () => {
    it('sets field errors', () => {
      const { result } = renderHook(() => useFormSubmission());
      
      act(() => {
        result.current.setFieldError('email', 'Invalid email');
      });
      
      expect(result.current.errors.email).toBe('Invalid email');
      expect(result.current.hasErrors).toBe(true);
    });

    it('sets field touched state', () => {
      const { result } = renderHook(() => useFormSubmission());
      
      act(() => {
        result.current.setFieldTouched('email', true);
      });
      
      expect(result.current.touched.email).toBe(true);
    });

    it('clears errors', () => {
      const { result } = renderHook(() => useFormSubmission());
      
      act(() => {
        result.current.setFieldError('email', 'Error');
        result.current.clearErrors();
      });
      
      expect(result.current.errors).toEqual({});
      expect(result.current.hasErrors).toBe(false);
    });

    it('resets form state', () => {
      const { result } = renderHook(() => useFormSubmission());
      
      act(() => {
        result.current.setFieldError('email', 'Error');
        result.current.setFieldTouched('email', true);
        result.current.resetForm();
      });
      
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.submitCount).toBe(0);
    });
  });
});

describe('usePagination', () => {
  const mockFetchFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchFunction.mockClear();
  });

  describe('Basic Functionality', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction)
      );
      
      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(true); // Initially loading
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('Data Loading', () => {
    it('loads initial page on mount', async () => {
      const mockData = { data: [1, 2, 3], total: 10 };
      mockFetchFunction.mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction, { pageSize: 5 })
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockFetchFunction).toHaveBeenCalledWith({
        page: 1,
        pageSize: 5,
        offset: 0
      });
      expect(result.current.data).toEqual([1, 2, 3]);
      expect(result.current.totalCount).toBe(10);
    });

    it('handles loading errors', async () => {
      const error = new Error('Load failed');
      mockFetchFunction.mockRejectedValue(error);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction)
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toMatchObject({
        message: 'Load failed'
      });
    });
  });

  describe('Pagination Actions', () => {
    it('refreshes data', async () => {
      const mockData = { data: [1, 2, 3], total: 10 };
      mockFetchFunction.mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction)
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.refresh();
      });
      
      expect(result.current.refreshing).toBe(false);
      expect(mockFetchFunction).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it('loads more data', async () => {
      const mockData1 = { data: [1, 2, 3], total: 10 };
      const mockData2 = { data: [4, 5, 6], total: 10 };
      
      mockFetchFunction
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction, { pageSize: 3 })
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.loadMore();
      });
      
      expect(result.current.data).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.current.currentPage).toBe(2);
    });

    it('resets pagination state', () => {
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction)
      );
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.data).toEqual([]);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('Pagination Logic', () => {
    it('determines if there is a next page', async () => {
      const mockData = { data: [1, 2, 3], total: 5 };
      mockFetchFunction.mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction, { pageSize: 3 })
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.hasNextPage).toBe(true);
    });

    it('detects when there is no next page', async () => {
      const mockData = { data: [1, 2], total: 2 };
      mockFetchFunction.mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction, { pageSize: 3 })
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.isLastPage).toBe(true);
    });

    it('detects empty state', async () => {
      const mockData = { data: [], total: 0 };
      mockFetchFunction.mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        usePagination(mockFetchFunction)
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isEmpty).toBe(true);
    });
  });
});

describe('useOptimisticUpdate', () => {
  describe('Basic Functionality', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useOptimisticUpdate());
      
      expect(result.current.optimisticData).toBe(null);
      expect(result.current.isOptimistic).toBe(false);
    });
  });

  describe('Optimistic Updates', () => {
    it('performs successful optimistic update', async () => {
      const mockUpdate = jest.fn().mockResolvedValue('real data');
      const onSuccessMock = jest.fn();
      
      const { result } = renderHook(() => useOptimisticUpdate());
      
      await act(async () => {
        const response = await result.current.performOptimisticUpdate(
          'optimistic data',
          mockUpdate,
          onSuccessMock
        );
        expect(response).toBe('real data');
      });
      
      expect(result.current.optimisticData).toBe('real data');
      expect(result.current.isOptimistic).toBe(false);
      expect(onSuccessMock).toHaveBeenCalledWith('real data');
    });

    it('reverts optimistic update on error', async () => {
      const error = new Error('Update failed');
      const mockUpdate = jest.fn().mockRejectedValue(error);
      const onErrorMock = jest.fn();
      
      const { result } = renderHook(() => useOptimisticUpdate());
      
      await act(async () => {
        try {
          await result.current.performOptimisticUpdate(
            'optimistic data',
            mockUpdate,
            undefined,
            onErrorMock
          );
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.optimisticData).toBe(null);
      expect(result.current.isOptimistic).toBe(false);
      expect(onErrorMock).toHaveBeenCalledWith(error);
    });

    it('clears optimistic state', () => {
      const { result } = renderHook(() => useOptimisticUpdate());
      
      act(() => {
        result.current.clearOptimistic();
      });
      
      expect(result.current.optimisticData).toBe(null);
      expect(result.current.isOptimistic).toBe(false);
    });
  });
});
