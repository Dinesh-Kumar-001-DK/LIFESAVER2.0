import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { alarmService } from './alarmService';
import { flashService } from './flashService';
import { smsService } from './smsService';
import { callService } from './callService';
import { locationService } from './locationService';
import { useAppStore } from '../store/appStore';

interface TriggerCallbacks {
  onTrigger: (type: 'Button' | 'Shake' | 'Volume' | 'Voice' | 'Fall') => void;
  onStop: () => void;
}

let shakeCount = 0;
let lastShakeTime = 0;
let accelerometerSubscription: { remove: () => void } | null = null;
let isListening = false;
let volumePressCount = 0;
let lastVolumePressTime = 0;

const SHAKE_THRESHOLD = 2.5;
const SHAKE_TIMEOUT = 3000;
const VOLUME_PRESS_TIMEOUT = 2000;
const REQUIRED_SHAKES = 3;
const REQUIRED_VOLUME_PRESSES = 3;
const AUTO_STOP_DELAY = 30000;

let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

export const triggerService = {
  startShakeDetection(onTrigger: () => void): void {
    if (isListening) return;
    isListening = true;

    Accelerometer.setUpdateInterval(100);

    accelerometerSubscription = Accelerometer.addListener(
      (measurement: AccelerometerMeasurement) => {
        const { x, y, z } = measurement;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        const now = Date.now();

        if (magnitude > SHAKE_THRESHOLD) {
          if (now - lastShakeTime > 1000) {
            shakeCount++;
            lastShakeTime = now;
          }
        }

        if (now - lastShakeTime > SHAKE_TIMEOUT) {
          shakeCount = 0;
        }

        if (shakeCount >= REQUIRED_SHAKES) {
          shakeCount = 0;
          lastShakeTime = 0;
          onTrigger();
        }
      }
    );
  },

  stopShakeDetection(): void {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      accelerometerSubscription = null;
    }
    isListening = false;
    shakeCount = 0;
  },

  onVolumePress(onTrigger: () => void): void {
    const { settings } = useAppStore.getState();
    
    if (!settings.volumeTriggerEnabled) {
      console.log('Volume trigger is disabled');
      return;
    }
    
    const now = Date.now();
    
    if (now - lastVolumePressTime > VOLUME_PRESS_TIMEOUT) {
      volumePressCount = 0;
    }
    
    volumePressCount++;
    lastVolumePressTime = now;

    if (volumePressCount >= REQUIRED_VOLUME_PRESSES) {
      volumePressCount = 0;
      lastVolumePressTime = 0;
      onTrigger();
    }
  },

  async triggerSOS(
    triggerType: 'Button' | 'Shake' | 'Volume' | 'Voice' | 'Fall',
    callbacks?: TriggerCallbacks
  ): Promise<void> {
    const store = useAppStore.getState();
    const { settings, emergencyContacts, addAlertToHistory, setAlarmActive, setLastLocation } = store;

    setAlarmActive(true);

    // Alarm - skip if testMode ON AND testAlarm toggle is ON (means disable alarm)
    if (settings.testMode && settings.testAlarm) {
      console.log('TEST MODE: Alarm DISABLED');
    } else {
      try {
        await alarmService.playAlarm();
      } catch (error) {
        console.error('Failed to play alarm:', error);
      }
    }

    if (settings.flashEnabled) {
      flashService.startSOSFlash();
    }

    if (settings.vibrationEnabled) {
      for (let i = 0; i < 5; i++) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    let location = 'Location unavailable';
    try {
      location = await locationService.getCurrentLocationLink();
      setLastLocation(location);
    } catch (error) {
      console.error('Failed to get location:', error);
    }

    // SMS - skip if testMode ON AND testSMS toggle is ON (means disable SMS)
    if (settings.smsEnabled) {
      if (settings.testMode && settings.testSMS) {
        console.log('TEST MODE: SMS DISABLED');
      } else {
        const contacts = emergencyContacts.map(c => c.phone);
        const smsResult = await smsService.sendEmergencySMS(contacts);
        console.log('SMS result:', smsResult);
      }
    }

    addAlertToHistory({
      location,
      contactsNotified: emergencyContacts.map(c => c.name),
      triggerType,
      duration: 0,
    });

    // Calls - skip if testMode ON AND testCalls toggle is ON (means disable calls)
    if (settings.callEnabled) {
      if (settings.testMode && settings.testCalls) {
        console.log('TEST MODE: Calls DISABLED');
      } else {
        callService.autoCallWithDelay(
          emergencyContacts.map(c => c.phone),
          5000,
          (seconds) => console.log(`Calling in ${seconds}...`),
          () => console.log('Call cancelled')
        );
      }
    }

    autoStopTimer = setTimeout(async () => {
      const currentState = useAppStore.getState();
      if (currentState.isAlarmActive) {
        await triggerService.stopSOS();
      }
    }, AUTO_STOP_DELAY);

    callbacks?.onTrigger(triggerType);
  },

  async stopSOS(): Promise<void> {
    const { setAlarmActive, settings } = useAppStore.getState();

    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      autoStopTimer = null;
    }

    // Stop alarm if not disabled by test mode
    if (!(settings.testMode && settings.testAlarm)) {
      try {
        await alarmService.stopAlarm();
      } catch (error) {
        console.error('Failed to stop alarm:', error);
      }

      try {
        await flashService.stopSOSFlash();
      } catch (error) {
        console.error('Failed to stop flash:', error);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setAlarmActive(false);
  },

  startTriggerListeners(onTrigger: () => void): void {
    const { settings } = useAppStore.getState();

    if (settings.shakeTriggerEnabled) {
      triggerService.startShakeDetection(onTrigger);
    }
  },

  stopTriggerListeners(): void {
    triggerService.stopShakeDetection();
  },
};

export const volumeService = {
  notifyVolumePress(): void {
    triggerService.onVolumePress(() => {
      triggerService.triggerSOS('Volume');
    });
  },
};
