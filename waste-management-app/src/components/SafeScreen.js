/**
 * SafeScreen Component
 * A wrapper component that ensures proper safe area handling and status bar configuration
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SafeScreen
 */

import React from 'react';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * SafeScreen Component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @param {Object} props.style - Additional styles
 * @param {Array} props.edges - Safe area edges to apply ['top', 'bottom', 'left', 'right']
 * @param {string} props.statusBarStyle - Status bar style ('light-content', 'dark-content')
 * @param {string} props.statusBarBackgroundColor - Status bar background color (Android)
 * @param {boolean} props.translucent - Whether status bar is translucent (Android)
 */
const SafeScreen = ({
  children,
  style,
  edges = ['top', 'left', 'right'],
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor = '#FFFFFF',
  translucent = false
}) => {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
        translucent={translucent}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  }
});

export default SafeScreen;
