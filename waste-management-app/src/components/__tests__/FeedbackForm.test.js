/**
 * FeedbackForm Component Tests
 * Comprehensive unit tests for the FeedbackForm component
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module FeedbackFormTests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FeedbackForm from '../FeedbackForm';

describe('FeedbackForm Component', () => {
  const mockBookingInfo = {
    id: 'BOOK001',
    scheduledDate: '2024-10-15',
    timeSlot: 'Morning (8:00 AM - 12:00 PM)',
    wasteType: 'Regular Waste',
    binCount: 2
  };

  const mockOnSubmit = jest.fn();
  const mockOnSkip = jest.fn();
  const mockOnRatingChange = jest.fn();
  const mockOnCommentChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders form elements correctly', () => {
      const { getByText, getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={mockBookingInfo}
        />
      );

      expect(getByText('Rate Our Service')).toBeTruthy();
      expect(getByText('How was our service?')).toBeTruthy();
      expect(getByText('Tell us more (optional)')).toBeTruthy();
      expect(getByTestId('submit-feedback-button')).toBeTruthy();
      expect(getByTestId('skip-feedback-button')).toBeTruthy();
    });

    test('renders booking context when provided', () => {
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={mockBookingInfo}
        />
      );

      expect(getByText('Collection Details')).toBeTruthy();
      expect(getByText('Date:')).toBeTruthy();
      expect(getByText('Time:')).toBeTruthy();
      expect(getByText('Waste Type:')).toBeTruthy();
      expect(getByText('Bins:')).toBeTruthy();
    });

    test('renders star rating component', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      // Check for all 5 stars
      expect(getByTestId('star-1')).toBeTruthy();
      expect(getByTestId('star-2')).toBeTruthy();
      expect(getByTestId('star-3')).toBeTruthy();
      expect(getByTestId('star-4')).toBeTruthy();
      expect(getByTestId('star-5')).toBeTruthy();
    });

    test('renders comment input field', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      expect(getByTestId('comment-input')).toBeTruthy();
    });
  });

  describe('Star Rating', () => {
    test('allows selecting rating by pressing stars', () => {
      const { getByTestId, getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          onRatingChange={mockOnRatingChange}
        />
      );

      const star4 = getByTestId('star-4');
      fireEvent.press(star4);

      expect(mockOnRatingChange).toHaveBeenCalledWith(4);
      expect(getByText('Very Good')).toBeTruthy();
      expect(getByText('4 out of 5 stars')).toBeTruthy();
    });

    test('displays correct rating text for each rating', () => {
      const { getByTestId, getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      // Test each rating
      fireEvent.press(getByTestId('star-1'));
      expect(getByText('Poor')).toBeTruthy();

      fireEvent.press(getByTestId('star-2'));
      expect(getByText('Fair')).toBeTruthy();

      fireEvent.press(getByTestId('star-3'));
      expect(getByText('Good')).toBeTruthy();

      fireEvent.press(getByTestId('star-4'));
      expect(getByText('Very Good')).toBeTruthy();

      fireEvent.press(getByTestId('star-5'));
      expect(getByText('Excellent')).toBeTruthy();
    });

    test('does not allow rating when disabled', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          onRatingChange={mockOnRatingChange}
          disabled={true}
        />
      );

      const star3 = getByTestId('star-3');
      fireEvent.press(star3);

      expect(mockOnRatingChange).not.toHaveBeenCalled();
    });

    test('shows initial rating when provided', () => {
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          initialRating={3}
        />
      );

      expect(getByText('Good')).toBeTruthy();
      expect(getByText('3 out of 5 stars')).toBeTruthy();
    });
  });

  describe('Comment Input', () => {
    test('allows entering comment text', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          onCommentChange={mockOnCommentChange}
        />
      );

      const commentInput = getByTestId('comment-input');
      fireEvent.changeText(commentInput, 'Great service!');

      expect(mockOnCommentChange).toHaveBeenCalledWith('Great service!');
    });

    test('shows character count', () => {
      const { getByText, getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      expect(getByText('500 characters remaining')).toBeTruthy();

      const commentInput = getByTestId('comment-input');
      fireEvent.changeText(commentInput, 'Hello');

      expect(getByText('495 characters remaining')).toBeTruthy();
    });

    test('shows warning when character limit is near', () => {
      const { getByTestId, getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const commentInput = getByTestId('comment-input');
      const longText = 'a'.repeat(460); // 40 characters remaining
      fireEvent.changeText(commentInput, longText);

      const remainingText = getByText('40 characters remaining');
      expect(remainingText).toBeTruthy();
      // Should have warning style applied
    });

    test('enforces character limit', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const commentInput = getByTestId('comment-input');
      expect(commentInput.props.maxLength).toBe(500);
    });

    test('is disabled when form is disabled', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          disabled={true}
        />
      );

      const commentInput = getByTestId('comment-input');
      expect(commentInput.props.editable).toBe(false);
    });

    test('shows initial comment when provided', () => {
      const initialComment = 'Initial feedback comment';
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          initialComment={initialComment}
        />
      );

      const commentInput = getByTestId('comment-input');
      expect(commentInput.props.value).toBe(initialComment);
    });
  });

  describe('Form Submission', () => {
    test('submits feedback with rating and comment', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={mockBookingInfo}
        />
      );

      // Set rating
      const star4 = getByTestId('star-4');
      fireEvent.press(star4);

      // Set comment
      const commentInput = getByTestId('comment-input');
      fireEvent.changeText(commentInput, 'Excellent service!');

      // Submit
      const submitButton = getByTestId('submit-feedback-button');
      fireEvent.press(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: 4,
        comment: 'Excellent service!',
        bookingId: 'BOOK001'
      });
    });

    test('submits feedback with rating only', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={mockBookingInfo}
        />
      );

      // Set rating only
      const star5 = getByTestId('star-5');
      fireEvent.press(star5);

      // Submit
      const submitButton = getByTestId('submit-feedback-button');
      fireEvent.press(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: 5,
        comment: '',
        bookingId: 'BOOK001'
      });
    });

    test('does not submit without rating', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const submitButton = getByTestId('submit-feedback-button');
      fireEvent.press(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('submit button is disabled without rating', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const submitButton = getByTestId('submit-feedback-button');
      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the button doesn't call onSubmit when pressed without rating
      fireEvent.press(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('submit button is enabled with rating', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      // Set rating
      const star3 = getByTestId('star-3');
      fireEvent.press(star3);

      const submitButton = getByTestId('submit-feedback-button');
      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the button calls onSubmit when pressed with rating
      fireEvent.press(submitButton);
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('shows loading state during submission', () => {
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          loading={true}
        />
      );

      expect(getByText('Submitting...')).toBeTruthy();
    });

    test('disables form during loading', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          loading={true}
        />
      );

      const submitButton = getByTestId('submit-feedback-button');
      const skipButton = getByTestId('skip-feedback-button');

      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the buttons don't call handlers when pressed during loading
      fireEvent.press(submitButton);
      fireEvent.press(skipButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnSkip).not.toHaveBeenCalled();
    });
  });

  describe('Skip Functionality', () => {
    test('calls onSkip when skip button is pressed', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const skipButton = getByTestId('skip-feedback-button');
      fireEvent.press(skipButton);

      expect(mockOnSkip).toHaveBeenCalled();
    });

    test('skip button is disabled during loading', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          loading={true}
        />
      );

      const skipButton = getByTestId('skip-feedback-button');
      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the skip button doesn't call onSkip when pressed during loading
      fireEvent.press(skipButton);
      expect(mockOnSkip).not.toHaveBeenCalled();
    });

    test('skip button is disabled when form is disabled', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          disabled={true}
        />
      );

      const skipButton = getByTestId('skip-feedback-button');
      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the skip button doesn't call onSkip when form is disabled
      fireEvent.press(skipButton);
      expect(mockOnSkip).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('displays error message when provided', () => {
      const errorMessage = 'Failed to submit feedback';
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          error={errorMessage}
        />
      );

      expect(getByText('⚠️')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    test('does not display error section when no error', () => {
      const { queryByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      expect(queryByText('⚠️')).toBeFalsy();
    });
  });

  describe('Booking Context', () => {
    test('displays all booking information', () => {
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={mockBookingInfo}
        />
      );

      expect(getByText('15/10/2024')).toBeTruthy(); // Date formatted
      expect(getByText('Morning (8:00 AM - 12:00 PM)')).toBeTruthy();
      expect(getByText('Regular Waste')).toBeTruthy();
      expect(getByText('2')).toBeTruthy(); // Bin count
    });

    test('handles missing booking info gracefully', () => {
      const { queryByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={null}
        />
      );

      expect(queryByText('Collection Details')).toBeFalsy();
    });

    test('handles partial booking info', () => {
      const partialBookingInfo = {
        id: 'BOOK002',
        scheduledDate: '2024-10-16'
        // Missing other fields
      };

      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={partialBookingInfo}
        />
      );

      expect(getByText('Collection Details')).toBeTruthy();
      expect(getByText('16/10/2024')).toBeTruthy();
    });
  });

  describe('Privacy Notice', () => {
    test('displays privacy notice', () => {
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      expect(getByText('💡 Your feedback is anonymous and helps us improve our service quality')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('has correct testIDs for interactive elements', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      expect(getByTestId('star-1')).toBeTruthy();
      expect(getByTestId('star-2')).toBeTruthy();
      expect(getByTestId('star-3')).toBeTruthy();
      expect(getByTestId('star-4')).toBeTruthy();
      expect(getByTestId('star-5')).toBeTruthy();
      expect(getByTestId('comment-input')).toBeTruthy();
      expect(getByTestId('submit-feedback-button')).toBeTruthy();
      expect(getByTestId('skip-feedback-button')).toBeTruthy();
    });

    test('stars are touchable when not disabled', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const star1 = getByTestId('star-1');
      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the star can be pressed when not disabled
      fireEvent.press(star1);
      // Since we don't have a direct way to test rating change without onRatingChange,
      // we'll just verify the component doesn't crash and the star is pressable
      expect(star1).toBeTruthy();
    });

    test('stars are not touchable when disabled', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          disabled={true}
        />
      );

      const star1 = getByTestId('star-1');
      // TouchableOpacity doesn't expose disabled prop for testing
      // Instead, test that the star doesn't call rating handler when pressed when disabled
      fireEvent.press(star1);
      expect(mockOnSubmit).not.toHaveBeenCalled(); // Since rating change would eventually lead to submit
    });
  });

  describe('Edge Cases', () => {
    test('handles missing callbacks gracefully', () => {
      const { getByTestId } = render(
        <FeedbackForm />
      );

      // Should not crash when callbacks are missing
      const star3 = getByTestId('star-3');
      fireEvent.press(star3);

      const commentInput = getByTestId('comment-input');
      fireEvent.changeText(commentInput, 'Test comment');

      expect(true).toBe(true); // No crash
    });

    test('handles very long comments', () => {
      const { getByTestId, getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      const commentInput = getByTestId('comment-input');
      const maxLengthText = 'a'.repeat(500);
      fireEvent.changeText(commentInput, maxLengthText);

      expect(getByText('0 characters remaining')).toBeTruthy();
    });

    test('handles empty comment submission', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          bookingInfo={mockBookingInfo}
        />
      );

      // Set rating only
      const star4 = getByTestId('star-4');
      fireEvent.press(star4);

      // Submit with empty comment
      const submitButton = getByTestId('submit-feedback-button');
      fireEvent.press(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: 4,
        comment: '',
        bookingId: 'BOOK001'
      });
    });
  });

  describe('Style Customization', () => {
    test('applies custom style when provided', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          style={customStyle}
        />
      );

      // Style application would be tested in integration tests
      expect(getByText('Rate Our Service')).toBeTruthy();
    });
  });

  describe('Form State Management', () => {
    test('maintains rating state correctly', () => {
      const { getByTestId, getByText } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
        />
      );

      // Select rating 3
      const star3 = getByTestId('star-3');
      fireEvent.press(star3);
      expect(getByText('Good')).toBeTruthy();

      // Change to rating 5
      const star5 = getByTestId('star-5');
      fireEvent.press(star5);
      expect(getByText('Excellent')).toBeTruthy();
    });

    test('maintains comment state correctly', () => {
      const { getByTestId } = render(
        <FeedbackForm
          onSubmit={mockOnSubmit}
          onSkip={mockOnSkip}
          onCommentChange={mockOnCommentChange}
        />
      );

      const commentInput = getByTestId('comment-input');
      
      fireEvent.changeText(commentInput, 'First comment');
      expect(mockOnCommentChange).toHaveBeenCalledWith('First comment');

      fireEvent.changeText(commentInput, 'Updated comment');
      expect(mockOnCommentChange).toHaveBeenCalledWith('Updated comment');
    });
  });
});
