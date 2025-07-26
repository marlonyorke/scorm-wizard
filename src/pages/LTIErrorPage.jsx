/**
 * LTI Error Page Component
 * Displays user-friendly error messages for LTI launch failures
 */

import React from 'react';
import PropTypes from 'prop-types';

const LTIErrorPage = ({ reason }) => {
  const getErrorMessage = (errorReason) => {
    switch (errorReason) {
      case 'invalid_launch':
        return {
          title: 'Invalid LTI Launch',
          message: 'This launch request is invalid. Please try launching the tool again from Moodle.',
          solution: 'Go back to Moodle and click the tool link again.'
        };
      case 'unauthorized':
        return {
          title: 'Access Denied',
          message: 'You are not authorized to access this tool. Please ensure you have the correct permissions in Moodle.',
          solution: 'Contact your instructor or system administrator for access.'
        };
      case 'expired_token':
        return {
          title: 'Session Expired',
          message: 'Your session has expired. Please launch the tool again from Moodle.',
          solution: 'Return to Moodle and click the tool link to start a new session.'
        };
      case 'launch_failed':
        return {
          title: 'Launch Failed',
          message: 'The tool could not be launched. This might be a temporary issue.',
          solution: 'Please try again in a few minutes. If the problem persists, contact support.'
        };
      default:
        return {
          title: 'LTI Launch Error',
          message: 'An unexpected error occurred while launching the tool.',
          solution: 'Please launch the tool from Moodle. If the problem persists, contact support.'
        };
    }
  };

  const error = getErrorMessage(reason);

  return (
    <div className="lti-error-page">
      <div className="error-container">
        <div className="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2"/>
          </svg>
        </div>
        
        <h1>{error.title}</h1>
        <p>{error.message}</p>
        
        <div className="error-details">
          <h3>What to do next:</h3>
          <ul>
            <li>{error.solution}</li>
            <li>Ensure you're launching from Moodle</li>
            <li>Check your internet connection</li>
            <li>Clear your browser cache and try again</li>
          </ul>
        </div>

        <div className="error-actions">
          <button 
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            Go Back
          </button>
          
          <button 
            onClick={() => window.location.href = '/lti/config'}
            className="btn btn-info"
          >
            View LTI Configuration
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>

        <div className="error-help">
          <h3>Need Help?</h3>
          <p>
            If you continue to experience issues, please contact your instructor or system administrator.
          </p>
          
          <div className="troubleshooting">
            <h4>Troubleshooting Steps:</h4>
            <ol>
              <li>Ensure you're accessing this tool from within Moodle</li>
              <li>Check that you're logged into Moodle</li>
              <li>Verify your browser allows third-party cookies</li>
              <li>Try using a different browser</li>
              <li>Clear your browser cache and cookies</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

LTIErrorPage.propTypes = {
  reason: PropTypes.string,
};

LTIErrorPage.defaultProps = {
  reason: 'generic_error',
};

export default LTIErrorPage;
