/**
 * Development Guide
 * Comprehensive guide for developers working on the Smart Waste Management System
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module DevelopmentGuide
 */

# Development Guide - Smart Waste Management System

## Table of Contents
1. [Project Overview](#project-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Code Architecture](#code-architecture)
4. [Component Development](#component-development)
5. [State Management](#state-management)
6. [Testing Strategy](#testing-strategy)
7. [Performance Guidelines](#performance-guidelines)
8. [Code Standards](#code-standards)
9. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
10. [Deployment Process](#deployment-process)

## Project Overview

The Smart Waste Management System is a React Native application that provides:
- Real-time bin monitoring through IoT sensors
- Intelligent scheduling algorithms
- User-friendly mobile interface
- Comprehensive error handling and offline support

### Key Technologies
- **React Native** 0.81.4
- **React Navigation** 6.x
- **Jest & React Native Testing Library** for testing
- **Expo** for development and deployment

## Development Environment Setup

### Prerequisites
```bash
# Node.js (v16+)
node --version

# npm or yarn
npm --version

# Expo CLI
npm install -g @expo/cli

# React Native CLI (optional)
npm install -g react-native-cli
```

### Initial Setup
1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd waste-management-app
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

### IDE Configuration

#### VS Code Extensions
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

#### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## Code Architecture

### Folder Structure Philosophy
```
src/
├── api/                    # API services and data access
│   ├── services/          # API service classes
│   ├── mockData.js        # Development mock data
│   └── __tests__/         # API tests
├── components/            # Reusable UI components
│   ├── common/           # Generic components
│   ├── forms/            # Form-specific components
│   └── __tests__/        # Component tests
├── constants/            # App-wide constants
│   ├── colors.js         # Color scheme
│   ├── spacing.js        # Spacing values
│   ├── typography.js     # Text styles
│   └── styles.js         # Common styles
├── hooks/                # Custom React hooks
├── navigation/           # Navigation configuration
├── screens/              # Screen components
├── utils/                # Utility functions
└── context/              # React context providers
```

### Design Patterns

#### Component Patterns
1. **Functional Components with Hooks**
   ```javascript
   const MyComponent = ({ prop1, prop2 }) => {
     const [state, setState] = useState(initialValue);
     
     useEffect(() => {
       // Side effects
     }, [dependencies]);
     
     return (
       <View>
         {/* JSX */}
       </View>
     );
   };
   ```

2. **Custom Hooks for Business Logic**
   ```javascript
   const useAsyncState = (config) => {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     
     const execute = async (operation) => {
       try {
         setLoading(true);
         setError(null);
         const result = await operation();
         return result;
       } catch (err) {
         setError(err);
         throw err;
       } finally {
         setLoading(false);
       }
     };
     
     return { loading, error, execute };
   };
   ```

3. **Container/Presentation Pattern**
   ```javascript
   // Container (Logic)
   const BinListContainer = ({ navigation }) => {
     const [bins, setBins] = useState([]);
     const { loading, error, execute } = useAsyncState();
     
     const loadBins = () => execute(() => BinService.getBins());
     
     return (
       <BinListPresentation
         bins={bins}
         loading={loading}
         error={error}
         onRefresh={loadBins}
       />
     );
   };
   
   // Presentation (UI)
   const BinListPresentation = ({ bins, loading, error, onRefresh }) => {
     if (loading) return <LoadingIndicator />;
     if (error) return <ErrorMessage error={error} />;
     
     return (
       <FlatList
         data={bins}
         renderItem={renderBinItem}
         refreshControl={<RefreshControl onRefresh={onRefresh} />}
       />
     );
   };
   ```

#### Error Handling Pattern
```javascript
// Custom Error Classes
class AppError extends Error {
  constructor(message, code, severity, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.details = details;
  }
}

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

## Component Development

### Component Structure
```javascript
/**
 * Component Description
 * Detailed explanation of what the component does
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title to display
 * @param {Function} props.onPress - Callback function
 */
const MyComponent = ({ title, onPress, style }) => {
  // 1. Hooks
  const [localState, setLocalState] = useState(null);
  
  // 2. Derived state
  const isActive = useMemo(() => {
    return localState?.status === 'active';
  }, [localState]);
  
  // 3. Event handlers
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);
  
  // 4. Effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, []);
  
  // 5. Render helpers
  const renderContent = () => {
    return <Text>{title}</Text>;
  };
  
  // 6. Main render
  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handlePress}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// 7. Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
  },
});

// 8. Default props and prop types (if using)
MyComponent.defaultProps = {
  title: 'Default Title',
};

export default MyComponent;
```

### Styling Guidelines

#### Use Design Tokens
```javascript
import { colors, spacing, typography } from '../constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
```

#### Responsive Design
```javascript
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isIOS = Platform.OS === 'ios';

const styles = StyleSheet.create({
  container: {
    padding: isTablet ? spacing.xl : spacing.md,
    paddingTop: isIOS ? spacing.xl : spacing.lg,
  },
});
```

## State Management

### Local State with Hooks
```javascript
// Simple state
const [count, setCount] = useState(0);

// Complex state with reducer
const [state, dispatch] = useReducer(reducer, initialState);

// Async state with custom hook
const { data, loading, error, execute } = useAsyncState();
```

### Context for Global State
```javascript
// Context definition
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bins, setBins] = useState([]);
  
  const value = {
    user,
    setUser,
    bins,
    setBins,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook for consuming context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### Data Flow Patterns
1. **Top-down data flow**
2. **Event bubbling for actions**
3. **Context for cross-cutting concerns**
4. **Local state for component-specific data**

## Testing Strategy

### Test Structure
```
__tests__/
├── components/         # Component tests
├── hooks/             # Hook tests
├── utils/             # Utility tests
├── screens/           # Screen integration tests
└── e2e/              # End-to-end tests
```

### Unit Testing
```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
  
  it('handles press events', async () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <MyComponent title="Test" onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('my-component'));
    
    await waitFor(() => {
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react-native';
import { useAsyncState } from '../useAsyncState';

describe('useAsyncState', () => {
  it('manages async operations', async () => {
    const { result } = renderHook(() => useAsyncState());
    
    expect(result.current.loading).toBe(false);
    
    const mockOperation = jest.fn().mockResolvedValue('success');
    
    await act(async () => {
      await result.current.execute(mockOperation);
    });
    
    expect(mockOperation).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});
```

### Testing Best Practices
1. **Test behavior, not implementation**
2. **Use meaningful test descriptions**
3. **Mock external dependencies**
4. **Test error conditions**
5. **Maintain test data separately**

## Performance Guidelines

### Optimization Strategies

#### Component Optimization
```javascript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// Use useMemo for expensive calculations
const MyComponent = ({ items }) => {
  const processedItems = useMemo(() => {
    return items.map(item => processItem(item));
  }, [items]);
  
  return <List items={processedItems} />;
};

// Use useCallback for stable function references
const MyComponent = ({ onSave }) => {
  const handleSave = useCallback((data) => {
    onSave(data);
  }, [onSave]);
  
  return <Form onSubmit={handleSave} />;
};
```

#### List Optimization
```javascript
// Use FlatList for large datasets
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

#### Image Optimization
```javascript
// Use appropriate image sizes
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode="cover"
  loadingIndicatorSource={require('./loading.png')}
/>

// Lazy load images
const LazyImage = ({ source, style }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <View style={style}>
      {!loaded && <LoadingPlaceholder />}
      <Image
        source={source}
        style={[style, { opacity: loaded ? 1 : 0 }]}
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
};
```

### Performance Monitoring
1. **Use Flipper for debugging**
2. **Monitor bundle size**
3. **Profile component re-renders**
4. **Measure loading times**
5. **Track memory usage**

## Code Standards

### ESLint Configuration
```json
{
  "extends": [
    "@react-native-community",
    "prettier"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `BinCard`, `LoadingIndicator`)
- **Files**: camelCase or PascalCase for components
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Props**: camelCase with descriptive names

### Code Documentation
```javascript
/**
 * Brief component description
 * 
 * Longer description if needed, explaining complex behavior,
 * usage patterns, or important implementation details.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display
 * @param {Function} props.onPress - Callback fired when pressed
 * @param {boolean} [props.disabled=false] - Whether the component is disabled
 * @param {Object} [props.style] - Additional styles to apply
 * 
 * @example
 * <MyComponent
 *   title="Hello World"
 *   onPress={() => console.log('Pressed')}
 *   disabled={false}
 * />
 */
```

## Debugging and Troubleshooting

### Common Issues

#### Navigation Problems
```javascript
// Ensure proper navigation prop passing
const MyScreen = ({ navigation, route }) => {
  // Use navigation.navigate, not this.props.navigation
  const handleNavigate = () => {
    navigation.navigate('TargetScreen', { param: 'value' });
  };
};

// For nested navigators, use proper navigation structure
navigation.navigate('MainTabs', {
  screen: 'Schedule',
  params: { screen: 'SchedulePickup' }
});
```

#### State Update Issues
```javascript
// Don't mutate state directly
// Wrong
state.items.push(newItem);
setState(state);

// Correct
setState(prevState => ({
  ...prevState,
  items: [...prevState.items, newItem]
}));
```

#### Async Issues
```javascript
// Handle race conditions
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    try {
      const data = await api.getData();
      if (isMounted) {
        setData(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
  };
}, []);
```

### Debugging Tools

#### React Native Debugger
```javascript
// Enable debugging
if (__DEV__) {
  console.log('Debug info:', debugData);
}

// Use debugger statement
const handleComplexOperation = () => {
  debugger; // Will pause execution in debugger
  // Complex logic here
};
```

#### Flipper Integration
```javascript
// Log to Flipper
import { logger } from 'flipper-plugin';

logger.info('User action performed', { userId, action });
logger.error('API request failed', { error, endpoint });
```

## Deployment Process

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console.log statements in production code
- [ ] Environment variables configured
- [ ] Bundle size within limits
- [ ] Performance tested
- [ ] Accessibility tested

### Build Process
```bash
# Clean install
rm -rf node_modules
npm install

# Run tests
npm test

# Build for production
npm run build:ios
npm run build:android
```

### Release Management
1. **Version Bumping**
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. **Change Log**
   - Document all changes
   - Include breaking changes
   - Note new features and bug fixes

3. **Testing Strategy**
   - Unit tests: 80%+ coverage
   - Integration tests for critical flows
   - Manual testing on devices
   - Performance testing

---

This guide should be updated regularly as the project evolves and new patterns emerge.
