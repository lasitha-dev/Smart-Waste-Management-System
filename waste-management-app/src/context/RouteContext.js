/**
 * RouteContext
 * Provides route data and collection management functions across the app
 */

import React, { createContext, useState, useContext } from 'react';
import { MOCK_STOPS } from '../api/mockData';

/**
 * Create the Route Context
 */
const RouteContext = createContext();

/**
 * RouteProvider Component
 * Wraps the app and provides route state and functions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The RouteProvider component
 */
export const RouteProvider = ({ children }) => {
  // State to manage the list of stops
  const [stops, setStops] = useState(MOCK_STOPS);

  /**
   * Updates the status of a stop
   * @param {number} stopId - ID of the stop to update
   * @param {string} newStatus - New status value
   */
  const updateStopStatus = (stopId, newStatus) => {
    setStops((prevStops) =>
      prevStops.map((stop) =>
        stop.id === stopId ? { ...stop, status: newStatus } : stop
      )
    );
  };

  /**
   * Handles collection confirmation - finds stop and updates to 'completed'
   * @param {string} binId - The bin ID to mark as completed
   */
  const handleCollectionConfirmed = (binId) => {
    setStops((prevStops) =>
      prevStops.map((stop) =>
        stop.binId === binId ? { ...stop, status: 'completed' } : stop
      )
    );
  };

  /**
   * Gets stop by bin ID
   * @param {string} binId - The bin ID to find
   * @returns {Object|undefined} The stop object or undefined
   */
  const getStopByBinId = (binId) => {
    return stops.find((stop) => stop.binId === binId);
  };

  /**
   * Gets statistics from current stops
   * @returns {Object} Statistics object
   */
  const getStatistics = () => {
    const completed = stops.filter((stop) => stop.status === 'completed').length;
    const pending = stops.filter((stop) => stop.status === 'pending').length;
    const total = stops.length;
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      pending,
      total,
      efficiency: `${efficiency}%`,
      issues: 0, // Placeholder for future implementation
    };
  };

  const value = {
    stops,
    updateStopStatus,
    handleCollectionConfirmed,
    getStopByBinId,
    getStatistics,
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};

/**
 * Custom hook to use the Route Context
 * @returns {Object} Context value with stops and functions
 * @throws {Error} If used outside of RouteProvider
 */
export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};

export default RouteContext;
