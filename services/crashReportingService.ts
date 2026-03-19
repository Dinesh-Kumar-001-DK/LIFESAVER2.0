import * as Sentry from '@sentry/react-native';
import { triggerService } from './triggerService';

const SENTRY_DSN = __DEV__
  ? 'https://your-dsn@sentry.io/project-id'
  : 'https://your-production-dsn@sentry.io/project-id';

let isInitialized = false;

export const crashReportingService = {
  async initialize(): Promise<void> {
    if (isInitialized) return;

    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        enabled: !__DEV__,
        environment: __DEV__ ? 'development' : 'production',
        tracesSampleRate: 0.1,
        maxBreadcrumbs: 50,
      });

      isInitialized = true;
    } catch (error) {
      console.error('Error initializing Sentry:', error);
    }
  },

  async captureException(error: Error, context?: Record<string, unknown>): Promise<void> {
    if (!isInitialized) return;

    try {
      Sentry.captureException(error, {
        extra: context,
      });
    } catch (err) {
      console.error('Error capturing exception:', err);
    }
  },

  async captureMessage(message: string): Promise<void> {
    if (!isInitialized) return;

    try {
      Sentry.captureMessage(message);
    } catch (error) {
      console.error('Error capturing message:', error);
    }
  },

  setUserContext(userId: string, email?: string): void {
    if (!isInitialized) return;

    Sentry.setUser({
      id: userId,
      email,
    });
  },

  clearUserContext(): void {
    if (!isInitialized) return;

    Sentry.setUser(null);
  },

  addBreadcrumb(message: string, data?: Record<string, unknown>): void {
    if (!isInitialized) return;

    Sentry.addBreadcrumb({
      message,
      data,
      timestamp: Date.now(),
    });
  },
};

export async function safeTriggerSOS(
  triggerType: 'Button' | 'Shake' | 'Volume' | 'Voice' | 'Fall'
): Promise<void> {
  try {
    await triggerService.triggerSOS(triggerType);
    crashReportingService.addBreadcrumb('SOS triggered', { triggerType });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await crashReportingService.captureException(err, { triggerType });
    throw error;
  }
}
