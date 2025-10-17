/**
 * ProvideFeedback Screen
 * Feedback submission screen for waste collection services
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ProvideFeedbackScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ProvideFeedback Screen Component
 */
const ProvideFeedbackScreen = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'service', label: 'Service Quality', icon: '⭐' },
    { id: 'timing', label: 'Timing', icon: '🕐' },
    { id: 'crew', label: 'Crew Behavior', icon: '👷' },
    { id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { id: 'other', label: 'Other', icon: '💭' },
  ];

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please provide a rating');
      return;
    }

    if (!category) {
      Alert.alert('Missing Category', 'Please select a feedback category');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Thank You! 🙏',
        'Your feedback has been submitted successfully. We appreciate your input!',
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              star <= rating && styles.starFilled
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCategory = (cat) => {
    const isSelected = category === cat.id;

    return (
      <TouchableOpacity
        key={cat.id}
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onPress={() => setCategory(cat.id)}
      >
        <Text style={styles.categoryIcon}>{cat.icon}</Text>
        <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
          {cat.label}
        </Text>
        {isSelected && <Text style={styles.categoryCheck}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provide Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>💬</Text>
          <Text style={styles.introTitle}>Share Your Experience</Text>
          <Text style={styles.introText}>
            Your feedback helps us improve our services and serve you better
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How would you rate our service?</Text>
          {renderStarRating()}
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 5 ? 'Excellent!' :
               rating === 4 ? 'Good' :
               rating === 3 ? 'Average' :
               rating === 2 ? 'Below Average' :
               'Needs Improvement'}
            </Text>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is your feedback about?</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(cat => renderCategory(cat))}
          </View>
        </View>

        {/* Feedback Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us more (optional)</Text>
          <TextInput
            style={styles.feedbackInput}
            multiline
            numberOfLines={6}
            placeholder="Share your thoughts, suggestions, or concerns..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{feedback.length}/500</Text>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>💡 Feedback Guidelines</Text>
          <Text style={styles.guidelineItem}>• Be specific and constructive</Text>
          <Text style={styles.guidelineItem}>• Focus on the service experience</Text>
          <Text style={styles.guidelineItem}>• Avoid personal information</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || !category || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || !category || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  backButton: {
    padding: 8
  },
  backIcon: {
    fontSize: 24,
    color: '#2E7D32'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1,
    padding: 16
  },
  introCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24
  },
  introIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12
  },
  starButton: {
    padding: 4
  },
  star: {
    fontSize: 40,
    color: '#E0E0E0'
  },
  starFilled: {
    color: '#FFD700'
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center'
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  categoryCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32'
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  categoryLabelSelected: {
    color: '#2E7D32',
    fontWeight: '600'
  },
  categoryCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold'
  },
  feedbackInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8
  },
  guidelinesCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 12
  },
  guidelineItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0'
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ProvideFeedbackScreen;
