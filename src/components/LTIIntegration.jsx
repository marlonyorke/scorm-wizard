/**
 * LTI Integration Component for React Frontend
 * Handles LTI launch data and user context display
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LTIIntegration = ({ onUserDataReceived }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeLTI = async () => {
      try {
        // Check if we have LTI launch data
        const urlParams = new URLSearchParams(window.location.search);
        const ltiData = urlParams.get('user');
        
        if (ltiData) {
          const parsedData = JSON.parse(decodeURIComponent(ltiData));
          setUserData(parsedData);
          
          if (onUserDataReceived) {
            onUserDataReceived(parsedData);
          }
          
          // Store in localStorage for persistence
          localStorage.setItem('ltiUserData', JSON.stringify(parsedData));
        } else {
          // Check localStorage for existing data
          const storedData = localStorage.getItem('ltiUserData');
          if (storedData) {
            setUserData(JSON.parse(storedData));
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error parsing LTI data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    initializeLTI();
  }, [onUserDataReceived]);

  const clearLTIData = () => {
    localStorage.removeItem('ltiUserData');
    setUserData(null);
  };

  if (loading) {
    return (
      <div className="lti-loading">
        <div className="spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lti-error">
        <h3>LTI Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="lti-no-data">
        <h3>Not launched from LTI</h3>
        <p>This application should be launched from Moodle.</p>
        <button onClick={() => window.location.href = '/lti-error'}>
          Launch from Moodle
        </button>
      </div>
    );
  }

  return (
    <div className="lti-user-panel">
      <h3>LTI User Information</h3>
      
      <div className="user-info">
        <div className="info-item">
          <strong>Name:</strong> {userData.name}
        </div>
        
        <div className="info-item">
          <strong>Email:</strong> {userData.email}
        </div>
        
        <div className="info-item">
          <strong>Role:</strong> {userData.role}
        </div>
        
        <div className="info-item">
          <strong>Course:</strong> {userData.context?.title}
        </div>
        
        <div className="info-item">
          <strong>Resource:</strong> {userData.resource?.title}
        </div>
      </div>

      <div className="lti-actions">
        <button 
          onClick={clearLTIData}
          className="btn btn-secondary"
        >
          Clear LTI Data
        </button>
        
        <button 
          onClick={() => window.open('/lti/config', '_blank')}
          className="btn btn-info"
        >
          View LTI Config
        </button>
      </div>
    </div>
  );
};

LTIIntegration.propTypes = {
  onUserDataReceived: PropTypes.func,
};

export default LTIIntegration;
