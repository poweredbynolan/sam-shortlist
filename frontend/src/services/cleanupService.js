import { storageService } from './storageService';

// Configuration
const CLEANUP_CONFIG = {
  INTERVAL: 1000 * 60 * 60, // Run cleanup every hour
  STORAGE_THRESHOLD: 0.8,    // 80% of quota
  MAX_ERRORS: 50,           // Maximum number of stored errors
  MAX_METRICS: 100,         // Maximum number of stored metrics
  MAX_ACTIVITY: 50,         // Maximum number of stored activity records
  MAX_OFFLINE: 20          // Maximum number of offline items
};

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.lastCleanup = null;
  }

  /**
   * Start the cleanup service
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleCleanup();
    
    console.log('Cleanup service started:', {
      timestamp: new Date().toISOString(),
      interval: `${CLEANUP_CONFIG.INTERVAL / 1000 / 60} minutes`
    });
  }

  /**
   * Stop the cleanup service
   */
  stop() {
    this.isRunning = false;
    console.log('Cleanup service stopped:', {
      timestamp: new Date().toISOString(),
      lastCleanup: this.lastCleanup
    });
  }

  /**
   * Schedule the next cleanup
   */
  scheduleCleanup() {
    if (!this.isRunning) return;

    setTimeout(async () => {
      await this.runCleanup();
      this.scheduleCleanup();
    }, CLEANUP_CONFIG.INTERVAL);
  }

  /**
   * Run the cleanup process
   */
  async runCleanup() {
    try {
      console.log('Starting cleanup:', {
        timestamp: new Date().toISOString()
      });

      const startTime = performance.now();
      
      // Check storage usage
      const estimate = await navigator.storage.estimate();
      const usagePercent = (estimate.usage / estimate.quota) * 100;

      console.log('Storage usage:', {
        used: estimate.usage,
        quota: estimate.quota,
        percentage: usagePercent.toFixed(2) + '%'
      });

      // Perform cleanup if storage is above threshold
      if (usagePercent > CLEANUP_CONFIG.STORAGE_THRESHOLD * 100) {
        await this.performStorageCleanup();
      }

      // Clean up expired data
      await storageService.cleanupExpiredData();

      // Trim metrics and logs
      await this.trimMetricsAndLogs();

      const duration = performance.now() - startTime;
      this.lastCleanup = new Date().toISOString();

      console.log('Cleanup completed:', {
        timestamp: this.lastCleanup,
        duration: `${duration.toFixed(2)}ms`,
        storageUsage: usagePercent.toFixed(2) + '%'
      });

    } catch (error) {
      console.error('Cleanup failed:', {
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  }

  /**
   * Perform storage cleanup when approaching quota
   */
  async performStorageCleanup() {
    try {
      // Get storage metrics
      const metrics = await storageService.getStorageMetrics();
      
      // Remove oldest items first
      const opportunities = await storageService.getAllOpportunities();
      const sortedOpportunities = opportunities.sort((a, b) => 
        a.metadata.lastAccessed - b.metadata.lastAccessed
      );

      // Remove bottom 20% of least accessed items
      const removalCount = Math.floor(sortedOpportunities.length * 0.2);
      for (let i = 0; i < removalCount; i++) {
        await storageService.removeOpportunity(sortedOpportunities[i].id);
      }

      console.log('Storage cleanup completed:', {
        timestamp: new Date().toISOString(),
        removedItems: removalCount,
        remainingItems: sortedOpportunities.length - removalCount
      });
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  }

  /**
   * Trim metrics and logs to prevent excessive storage usage
   */
  async trimMetricsAndLogs() {
    try {
      // Trim error logs
      const errorLog = await storageService.getErrorLog();
      if (errorLog.length > CLEANUP_CONFIG.MAX_ERRORS) {
        const trimmedLog = errorLog.slice(-CLEANUP_CONFIG.MAX_ERRORS);
        await storageService.setErrorLog(trimmedLog);
      }

      // Trim performance metrics
      const metrics = await storageService.getPerformanceMetrics();
      if (metrics.length > CLEANUP_CONFIG.MAX_METRICS) {
        const trimmedMetrics = metrics.slice(-CLEANUP_CONFIG.MAX_METRICS);
        await storageService.setPerformanceMetrics(trimmedMetrics);
      }

      // Trim user activity
      const activity = await storageService.getUserActivity();
      if (activity.sessions.length > CLEANUP_CONFIG.MAX_ACTIVITY) {
        activity.sessions = activity.sessions.slice(-CLEANUP_CONFIG.MAX_ACTIVITY);
        await storageService.setUserActivity(activity);
      }

      // Trim offline queue
      const offlineQueue = await storageService.getOfflineQueue();
      if (offlineQueue.length > CLEANUP_CONFIG.MAX_OFFLINE) {
        const trimmedQueue = offlineQueue.slice(-CLEANUP_CONFIG.MAX_OFFLINE);
        await storageService.setOfflineQueue(trimmedQueue);
      }

      console.log('Metrics and logs trimmed:', {
        timestamp: new Date().toISOString(),
        errorLogSize: errorLog.length,
        metricsSize: metrics.length,
        activitySize: activity.sessions.length,
        offlineQueueSize: offlineQueue.length
      });
    } catch (error) {
      console.error('Failed to trim metrics and logs:', error);
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
