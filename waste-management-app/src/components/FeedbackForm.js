/**
 * FeedbackForm Component
 * Interactive form for collecting user feedback with star ratings and comments
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module FeedbackForm
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { InlineLoader } from './LoadingIndicator';
import { StatusMessage } from './Toast';
import { COLORS, FONTS, STYLES, createButtonStyle } from '../constants/theme';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

/**
 * FeedbackForm component for collecting user feedback
 * @param {Object} props - Component props
 * @param {number} props.initialRating - Initial rating value (1-5)
 * @param {string} props.initialComment - Initial comment text
 * @param {Function} props.onRatingChange - Callback when rating changes
 * @param {Function} props.onCommentChange - Callback when comment changes
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Function} props.onSkip - Callback when feedback is skipped
 * @param {boolean} props.loading - Whether submission is in progress
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {string} props.error - Error message to display
 * @param {Object} props.bookingInfo - Booking information for context
 * @param {string} props.style - Additional styles
 */
const FeedbackForm = ({
  initialRating = 0,
  initialComment = '',
  onRatingChange,
  onCommentChange,
  onSubmit,
  onSkip,
  loading = false,
  disabled = false,
  error = null,
  bookingInfo = null,
  style
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [starAnimations] = useState(Array.from({ length: 5 }, () => new Animated.Value(1)));
  const commentInputRef = useRef(null);

  const handleRatingPress = (selectedRating) => {
    if (disabled) return;

    setRating(selectedRating);
    
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }

    // Animate the selected star
    starAnimations.forEach((animation, index) => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: index < selectedRating ? 1.2 : 1,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    });
  };

  const handleCommentChange = (text) => {
    setComment(text);
    
    if (onCommentChange) {
      onCommentChange(text);
    }
  };

  const handleSubmit = () => {
    if (disabled || loading || rating === 0) return;

    if (onSubmit) {
      onSubmit({
        rating,
        comment: comment.trim(),
        bookingId: bookingInfo?.id
      });
    }
  };

  const handleSkip = () => {
    if (disabled || loading) return;

    if (onSkip) {
      onSkip();
    }
  };

  const getRatingText = (ratingValue) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[ratingValue] || '';
  };

  const getRatingColor = (ratingValue) => {
    const ratingColors = {
      1: colors.error,
      2: colors.warning,
      3: colors.secondary,
      4: colors.success,
      5: colors.success
    };
    return ratingColors[ratingValue] || colors.textSecondary;
  };

  const renderStarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>How was our service?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((starValue) => (
            <TouchableOpacity
              key={starValue}
              style={styles.starButton}
              onPress={() => handleRatingPress(starValue)}
              disabled={disabled}
              testID={`star-${starValue}`}
            >
              <Animated.Text
                style={[
                  styles.star,
                  {
                    color: starValue <= rating ? colors.warning : colors.disabled,
                    transform: [{ scale: starAnimations[starValue - 1] }]
                  }
                ]}
              >
                ★
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <View style={styles.ratingTextContainer}>
            <Text style={[
              styles.ratingText,
              { color: getRatingColor(rating) }
            ]}>
              {getRatingText(rating)}
            </Text>
            <Text style={styles.ratingSubtext}>
              {rating} out of 5 stars
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCommentSection = () => {
    const characterLimit = 500;
    const remainingChars = characterLimit - comment.length;

    return (
      <View style={styles.commentContainer}>
        <Text style={styles.commentLabel}>
          Tell us more (optional)
        </Text>
        
        <TextInput
          ref={commentInputRef}
          style={[
            styles.commentInput,
            disabled && styles.disabledInput,
            error && styles.errorInput
          ]}
          multiline
          numberOfLines={4}
          placeholder="Share your experience with our waste collection service..."
          placeholderTextColor={colors.textSecondary}
          value={comment}
          onChangeText={handleCommentChange}
          maxLength={characterLimit}
          editable={!disabled && !loading}
          textAlignVertical="top"
          testID="comment-input"
        />
        
        <View style={styles.commentFooter}>
          <Text style={[
            styles.characterCount,
            remainingChars < 50 && styles.characterCountWarning
          ]}>
            {remainingChars} characters remaining
          </Text>
        </View>
      </View>
    );
  };

  const renderBookingContext = () => {
    if (!bookingInfo) return null;

    return (
      <View style={styles.contextContainer}>
        <Text style={styles.contextTitle}>Collection Details</Text>
        
        <View style={styles.contextRow}>
          <Text style={styles.contextLabel}>Date:</Text>
          <Text style={styles.contextValue}>
            {new Date(bookingInfo.scheduledDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.contextRow}>
          <Text style={styles.contextLabel}>Time:</Text>
          <Text style={styles.contextValue}>{bookingInfo.timeSlot}</Text>
        </View>
        
        <View style={styles.contextRow}>
          <Text style={styles.contextLabel}>Waste Type:</Text>
          <Text style={styles.contextValue}>{bookingInfo.wasteType}</Text>
        </View>
        
        <View style={styles.contextRow}>
          <Text style={styles.contextLabel}>Bins:</Text>
          <Text style={styles.contextValue}>{bookingInfo.binCount || 0}</Text>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    const canSubmit = rating > 0 && !loading && !disabled;

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmit && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          testID="submit-feedback-button"
        >
          {loading ? (
            <InlineLoader text="Submitting..." size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.submitButtonText,
              !canSubmit && styles.disabledButtonText
            ]}>
              Submit Feedback
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.skipButton,
            (loading || disabled) && styles.disabledButton
          ]}
          onPress={handleSkip}
          disabled={loading || disabled}
          testID="skip-feedback-button"
        >
          <Text style={[
            styles.skipButtonText,
            (loading || disabled) && styles.disabledButtonText
          ]}>
            Skip for Now
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <StatusMessage
        type="error"
        title="Submission Failed"
        message={error}
        visible={true}
        action={{
          text: 'Try Again',
          onPress: () => handleSubmit()
        }}
        style={styles.errorMessage}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rate Our Service</Text>
          <Text style={styles.subtitle}>
            Your feedback helps us improve our waste collection service
          </Text>
        </View>

        {/* Booking Context */}
        {renderBookingContext()}

        {/* Star Rating */}
        {renderStarRating()}

        {/* Comment Section */}
        {renderCommentSection()}

        {/* Error Display */}
        {renderError()}

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Privacy Note */}
        <StatusMessage
          type="info"
          message="💡 Your feedback is anonymous and helps us improve our service quality"
          visible={true}
          style={styles.privacyNote}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Using theme colors from constants/theme.js

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBackground
  },
  scrollContainer: {
    flex: 1
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary
  },
  title: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8
  },
  subtitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22
  },
  contextContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12
  },
  contextTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  contextLabel: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary
  },
  contextValue: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal
  },
  ratingContainer: {
    padding: 24,
    alignItems: 'center'
  },
  ratingLabel: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 20
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  starButton: {
    padding: 8,
    marginHorizontal: 4
  },
  star: {
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  ratingTextContainer: {
    alignItems: 'center'
  },
  ratingText: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    marginBottom: 4
  },
  ratingSubtext: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary
  },
  commentContainer: {
    padding: 20
  },
  commentLabel: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12
  },
  commentInput: {
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: FONTS.size.body,
    color: COLORS.primaryDarkTeal,
    backgroundColor: COLORS.modalBackground,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  disabledInput: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.textSecondary
  },
  errorInput: {
    borderColor: COLORS.alertRed
  },
  commentFooter: {
    alignItems: 'flex-end',
    marginTop: 8
  },
  characterCount: {
    fontSize: FONTS.size.small - 2,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary
  },
  characterCountWarning: {
    color: COLORS.highPriorityRed
  },
  errorMessage: {
    marginHorizontal: 20,
    marginVertical: 8
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: COLORS.modalBackground,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.alertRed
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12
  },
  errorText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.regular,
    color: COLORS.alertRed,
    flex: 1
  },
  actionsContainer: {
    padding: 20,
    gap: 12
  },
  submitButton: {
    ...STYLES.button,
    ...STYLES.primaryButton,
  },
  submitButtonText: {
    ...STYLES.buttonText
  },
  skipButton: {
    ...STYLES.button,
    ...STYLES.secondaryButton,
    borderColor: COLORS.textSecondary
  },
  skipButtonText: {
    ...STYLES.secondaryButtonText,
    color: COLORS.textSecondary
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
    borderColor: COLORS.textSecondary
  },
  disabledButtonText: {
    color: COLORS.textPrimary
  },
  privacyNote: {
    margin: 20,
    padding: 16,
    backgroundColor: COLORS.modalBackground,
    borderRadius: 8,
    alignItems: 'center'
  },
  privacyText: {
    fontSize: FONTS.size.small - 2,
    fontWeight: FONTS.weight.regular,
    color: COLORS.primaryDarkTeal,
    textAlign: 'center',
    lineHeight: 18
  }
});

export default FeedbackForm;
