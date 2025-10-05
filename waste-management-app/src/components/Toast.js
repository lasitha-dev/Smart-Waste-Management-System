/**
 * Toast Component
 * Reusable toast notification system for user feedback
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module Toast
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Toast notification component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether toast is visible
 * @param {string} props.type - Toast type ('success', 'error', 'warning', 'info')
 * @param {string} props.title - Toast title
 * @param {string} props.message - Toast message
 * @param {number} props.duration - Auto-hide duration in ms (0 for persistent)
 * @param {string} props.position - Toast position ('top', 'bottom', 'center')
 * @param {Function} props.onHide - Callback when toast is hidden
 * @param {Function} props.onPress - Callback when toast is pressed
 * @param {boolean} props.swipeable - Whether toast can be swiped to dismiss
 * @param {Object} props.action - Action button config { text, onPress }
 */
const Toast = ({
  visible = false,
  type = 'info',
  title = '',
  message = '',
  duration = 4000,
  position = 'top',
  onHide,
  onPress,
  swipeable = true,
  action = null
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [visible]);

  const show = () => {
    setIsVisible(true);
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    // Auto-hide if duration is set
    if (duration > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        hide();
      }, duration);
    }
  };

  const hide = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'bottom' ? 100 : -100,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsVisible(false);
      if (onHide) {
        onHide();
      }
    });
  };

  const handleSwipe = (gestureState) => {
    if (!swipeable) return;

    const { dy, vy } = gestureState;
    
    if (Math.abs(dy) > 50 || Math.abs(vy) > 500) {
      hide();
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return swipeable && Math.abs(gestureState.dy) > 10;
    },
    onPanResponderRelease: (evt, gestureState) => {
      handleSwipe(gestureState);
    },
  });

  const getTypeConfig = () => {
    const configs = {
      success: {
        backgroundColor: '#4CAF50',
        icon: '✅',
        textColor: '#FFFFFF'
      },
      error: {
        backgroundColor: '#f44336',
        icon: '❌',
        textColor: '#FFFFFF'
      },
      warning: {
        backgroundColor: '#FF9800',
        icon: '⚠️',
        textColor: '#FFFFFF'
      },
      info: {
        backgroundColor: '#2196F3',
        icon: 'ℹ️',
        textColor: '#FFFFFF'
      }
    };
    return configs[type] || configs.info;
  };

  const typeConfig = getTypeConfig();

  const getPositionStyle = () => {
    const styles = {
      top: { top: 50 },
      bottom: { bottom: 50 },
      center: { top: height / 2 - 50 }
    };
    return styles[position] || styles.top;
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, getPositionStyle()]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.toast,
          {
            backgroundColor: typeConfig.backgroundColor,
            transform: [
              { translateY },
              { scale }
            ],
            opacity
          }
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          activeOpacity={onPress ? 0.8 : 1}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{typeConfig.icon}</Text>
          </View>
          
          <View style={styles.textContainer}>
            {title && (
              <Text style={[styles.title, { color: typeConfig.textColor }]}>
                {title}
              </Text>
            )}
            {message && (
              <Text style={[styles.message, { color: typeConfig.textColor }]}>
                {message}
              </Text>
            )}
          </View>

          {action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <Text style={[styles.actionText, { color: typeConfig.textColor }]}>
                {action.text}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={hide}
          >
            <Text style={[styles.closeText, { color: typeConfig.textColor }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

/**
 * Toast Manager for handling multiple toasts
 */
class ToastManager {
  static toastRef = null;

  static setRef(ref) {
    this.toastRef = ref;
  }

  static show(config) {
    if (this.toastRef) {
      this.toastRef.show(config);
    }
  }

  static hide() {
    if (this.toastRef) {
      this.toastRef.hide();
    }
  }

  static success(message, title = 'Success') {
    this.show({
      type: 'success',
      title,
      message,
      duration: 3000
    });
  }

  static error(message, title = 'Error') {
    this.show({
      type: 'error',
      title,
      message,
      duration: 5000
    });
  }

  static warning(message, title = 'Warning') {
    this.show({
      type: 'warning',
      title,
      message,
      duration: 4000
    });
  }

  static info(message, title = 'Info') {
    this.show({
      type: 'info',
      title,
      message,
      duration: 3000
    });
  }
}

/**
 * ToastProvider component to be placed at root level
 */
export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    duration: 3000,
    position: 'top',
    onHide: null,
    onPress: null,
    swipeable: true,
    action: null
  });

  const toastRef = {
    show: (config) => {
      setToastConfig({
        ...toastConfig,
        ...config,
        visible: true
      });
    },
    hide: () => {
      setToastConfig(prev => ({
        ...prev,
        visible: false
      }));
    }
  };

  React.useEffect(() => {
    ToastManager.setRef(toastRef);
  }, []);

  return (
    <View style={styles.provider}>
      {children}
      <Toast
        {...toastConfig}
        onHide={() => {
          setToastConfig(prev => ({ ...prev, visible: false }));
          if (toastConfig.onHide) {
            toastConfig.onHide();
          }
        }}
      />
    </View>
  );
};

/**
 * Status Message component for inline feedback
 */
export const StatusMessage = ({
  type = 'info',
  title = '',
  message = '',
  visible = true,
  onDismiss = null,
  action = null,
  style
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);

  const getStatusConfig = () => {
    const configs = {
      success: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
        icon: '✅',
        textColor: '#2E7D32'
      },
      error: {
        backgroundColor: '#FFEBEE',
        borderColor: '#f44336',
        icon: '❌',
        textColor: '#C62828'
      },
      warning: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
        icon: '⚠️',
        textColor: '#F57C00'
      },
      info: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
        icon: 'ℹ️',
        textColor: '#1565C0'
      }
    };
    return configs[type] || configs.info;
  };

  if (!visible) return null;

  const statusConfig = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.statusMessage,
        {
          backgroundColor: statusConfig.backgroundColor,
          borderColor: statusConfig.borderColor,
          opacity: fadeAnim
        },
        style
      ]}
    >
      <View style={styles.statusContent}>
        <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
        
        <View style={styles.statusTextContainer}>
          {title && (
            <Text style={[styles.statusTitle, { color: statusConfig.textColor }]}>
              {title}
            </Text>
          )}
          {message && (
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {message}
            </Text>
          )}
        </View>

        {action && (
          <TouchableOpacity
            style={[styles.statusAction, { borderColor: statusConfig.borderColor }]}
            onPress={action.onPress}
          >
            <Text style={[styles.statusActionText, { color: statusConfig.textColor }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            style={styles.statusClose}
            onPress={onDismiss}
          >
            <Text style={[styles.statusCloseText, { color: statusConfig.textColor }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  provider: {
    flex: 1
  },
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999
  },
  toast: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  iconContainer: {
    marginRight: 12
  },
  icon: {
    fontSize: 20
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2
  },
  message: {
    fontSize: 14,
    lineHeight: 20
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  closeButton: {
    padding: 4,
    marginLeft: 8
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  statusMessage: {
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginVertical: 8
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 12
  },
  statusTextContainer: {
    flex: 1
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16
  },
  statusAction: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 8
  },
  statusActionText: {
    fontSize: 11,
    fontWeight: '600'
  },
  statusClose: {
    padding: 4,
    marginLeft: 8
  },
  statusCloseText: {
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export { Toast, ToastManager };
export default Toast;
