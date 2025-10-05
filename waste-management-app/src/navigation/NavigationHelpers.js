/**
 * Navigation helper functions for use throughout the app
 * @author Kumarasinghe S.S (IT22221414)
 */

export const NavigationHelpers = {
  /**
   * Navigates to the scheduling flow
   * @param {object} navigation - Navigation object
   */
  navigateToScheduling: (navigation) => {
    navigation.navigate('Schedule', {
      screen: 'SchedulePickup'
    });
  },

  /**
   * Navigates to feedback screen with booking info
   * @param {object} navigation - Navigation object
   * @param {string} bookingId - Booking ID
   * @param {object} bookingInfo - Booking information
   */
  navigateToFeedback: (navigation, bookingId, bookingInfo = null) => {
    navigation.navigate('FeedbackModal', {
      screen: 'ProvideFeedback',
      params: {
        bookingId,
        bookingInfo
      }
    });
  },

  /**
   * Resets navigation to home screen
   * @param {object} navigation - Navigation object
   */
  resetToHome: (navigation) => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          state: {
            routes: [{ name: 'Home' }],
            index: 0,
          },
        },
      ],
    });
  },

  /**
   * Navigates to booking history
   * @param {object} navigation - Navigation object
   */
  navigateToHistory: (navigation) => {
    navigation.navigate('MainTabs', {
      screen: 'History'
    });
  }
};
