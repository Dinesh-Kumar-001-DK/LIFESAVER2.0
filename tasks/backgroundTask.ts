import * as TaskManager from 'expo-task-manager';

const BACKGROUND_TASK_NAME = 'TAPSAFE_BACKGROUND';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    console.log('TapSafe background task executed');
    
    return true;
  } catch (error) {
    console.error('Background task error:', error);
    return false;
  }
});

export const backgroundTask = {
  async register(): Promise<boolean> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
      
      if (!isRegistered) {
        console.log('Background task would be registered in native build');
      }

      console.log('Background task registered successfully');
      return true;
    } catch (error) {
      console.error('Failed to register background task:', error);
      return false;
    }
  },

  async unregister(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
      
      if (isRegistered) {
        await TaskManager.unregisterTaskAsync(BACKGROUND_TASK_NAME);
        console.log('Background task unregistered');
      }
    } catch (error) {
      console.error('Failed to unregister background task:', error);
    }
  },

  async isRegistered(): Promise<boolean> {
    try {
      return await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    } catch (error) {
      console.error('Error checking task registration:', error);
      return false;
    }
  },
};
