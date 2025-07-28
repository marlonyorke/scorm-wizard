// Offline functionality and connection recovery manager
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingRequests = [];
    this.setupEventListeners();
    this.loadPendingRequests();
  }

  setupEventListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  handleOnline() {
    console.log('Connection restored - processing pending requests');
    this.processPendingRequests();
    this.isOnline = true;
  }

  handleOffline() {
    console.log('Connection lost - storing requests locally');
    this.isOnline = false;
  }

  async saveOffline(key, data) {
    try {
      const offlineData = {
        ...data,
        timestamp: Date.now(),
        synced: false
      };
      
      const existing = await this.getOfflineData(key) || [];
      existing.push(offlineData);
      
      localStorage.setItem(`offline_${key}`, JSON.stringify(existing));
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  async getOfflineData(key) {
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return [];
    }
  }

  async processPendingRequests() {
    const pending = await this.getOfflineData('requests');
    
    for (const request of pending) {
      try {
        const response = await this.executeRequest(request);
        if (response.ok) {
          await this.removeProcessedRequest(request);
        }
      } catch (error) {
        console.error('Failed to process pending request:', error);
      }
    }
  }

  async executeRequest(request) {
    return fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }

  async removeProcessedRequest(request) {
    const pending = await this.getOfflineData('requests');
    const updated = pending.filter(item => item.timestamp !== request.timestamp);
    localStorage.setItem('offline_requests', JSON.stringify(updated));
  }

  async queueRequest(request) {
    if (this.isOnline) {
      return this.executeRequest(request);
    }
    
    return this.saveOffline('requests', request);
  }

  async retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        console.log(`Retry attempt ${i + 1}/${maxRetries}`);
      }
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      pendingRequests: this.pendingRequests.length,
      lastSync: localStorage.getItem('lastSyncTime')
    };
  }

  async clearOfflineData() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Usage example
const offlineManager = new OfflineManager();

export default offlineManager;
