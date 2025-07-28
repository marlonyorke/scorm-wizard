// SCORM API Implementation
export const createScormAPI = () => {
  const apiContent = `
    var API = {
      initialized: false,
      terminated: false,
      lastError: '0',
      studentData: {
        score: 0,
        status: 'not attempted',
        suspend_data: ''
      },

      LMSInitialize: function(str) {
        if (this.initialized) {
          this.lastError = '101';
          return 'false';
        }
        this.initialized = true;
        this.terminated = false;
        this.lastError = '0';
        return 'true';
      },

      LMSFinish: function(str) {
        if (!this.initialized || this.terminated) {
          this.lastError = '301';
          return 'false';
        }
        this.terminated = true;
        this.initialized = false;
        return 'true';
      },

      LMSGetValue: function(element) {
        if (!this.initialized || this.terminated) {
          this.lastError = '301';
          return '';
        }

        switch (element) {
          case 'cmi.core.score.raw':
            return this.studentData.score.toString();
          case 'cmi.core.lesson_status':
            return this.studentData.status;
          case 'cmi.suspend_data':
            return this.studentData.suspend_data;
          default:
            this.lastError = '401';
            return '';
        }
      },

      LMSSetValue: function(element, value) {
        if (!this.initialized || this.terminated) {
          this.lastError = '301';
          return 'false';
        }

        switch (element) {
          case 'cmi.core.score.raw':
            const score = parseInt(value);
            if (isNaN(score) || score < 0 || score > 100) {
              this.lastError = '405';
              return 'false';
            }
            this.studentData.score = score;
            break;
          case 'cmi.core.lesson_status':
            if (!['not attempted', 'incomplete', 'completed', 'failed', 'passed'].includes(value)) {
              this.lastError = '405';
              return 'false';
            }
            this.studentData.status = value;
            break;
          case 'cmi.suspend_data':
            this.studentData.suspend_data = value;
            break;
          default:
            this.lastError = '401';
            return 'false';
        }

        this.lastError = '0';
        return 'true';
      },

      LMSCommit: function(str) {
        if (!this.initialized || this.terminated) {
          this.lastError = '301';
          return 'false';
        }
        return 'true';
      },

      LMSGetLastError: function() {
        return this.lastError;
      },

      LMSGetErrorString: function(errorCode) {
        const errorStrings = {
          '0': 'No error',
          '101': 'General initialization failure',
          '201': 'Invalid argument error',
          '301': 'Not initialized',
          '401': 'Not implemented error',
          '402': 'Invalid set value, element is a keyword',
          '403': 'Element is read only',
          '404': 'Element is write only',
          '405': 'Incorrect data type'
        };
        return errorStrings[errorCode] || 'Unknown error';
      },

      LMSGetDiagnostic: function(errorCode) {
        return this.LMSGetErrorString(errorCode || this.lastError);
      }
    };
  `;
  return apiContent;
};