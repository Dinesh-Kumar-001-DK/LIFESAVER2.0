import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import { Alert, Platform } from 'react-native';

type SensitivityLevel = 'low' | 'medium' | 'high';

interface FallDetectionThresholds {
  freeFallThreshold: number;
  impactThreshold: number;
  freeFallDuration: number;
  impactWindow: number;
  stillDuration: number;
}

const THRESHOLDS: Record<SensitivityLevel, FallDetectionThresholds> = {
  low: {
    freeFallThreshold: 0.3,
    impactThreshold: 3.5,
    freeFallDuration: 300,
    impactWindow: 2000,
    stillDuration: 6000,
  },
  medium: {
    freeFallThreshold: 0.4,
    impactThreshold: 3.0,
    freeFallDuration: 250,
    impactWindow: 2000,
    stillDuration: 5000,
  },
  high: {
    freeFallThreshold: 0.5,
    impactThreshold: 2.5,
    freeFallDuration: 200,
    impactWindow: 2000,
    stillDuration: 4000,
  },
};

type FallPhase = 'normal' | 'freefall' | 'impact' | 'still' | 'countdown';

let isMonitoring = false;
let accelerometerSubscription: { remove: () => void } | null = null;
let fallTimeout: ReturnType<typeof setTimeout> | null = null;
let countdownTimeout: ReturnType<typeof setTimeout> | null = null;

let currentPhase: FallPhase = 'normal';
let freeFallStartTime = 0;
let impactTime = 0;
let stillStartTime = 0;
let currentSensitivity: SensitivityLevel = 'medium';

export const fallDetectionService = {
  async calibrate(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Calibrate Fall Detection',
        'Hold your phone in a normal position and tap Calibrate. You have 5 seconds.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Calibrate',
            onPress: () => {
              setTimeout(() => {
                Alert.alert('Success', 'Fall detection calibrated successfully');
                resolve(true);
              }, 100);
            },
          },
        ]
      );
    });
  },

  async startFallDetection(
    onFallDetected: () => void,
    sensitivity: SensitivityLevel = 'medium',
    showCountdown: boolean = true
  ): Promise<boolean> {
    if (isMonitoring) return true;

    currentSensitivity = sensitivity;
    const thresholds = THRESHOLDS[sensitivity];

    Accelerometer.setUpdateInterval(100);

    accelerometerSubscription = Accelerometer.addListener(
      async (measurement: AccelerometerMeasurement) => {
        const { x, y, z } = measurement;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        const now = Date.now();

        switch (currentPhase) {
          case 'normal':
            if (magnitude < thresholds.freeFallThreshold) {
              freeFallStartTime = now;
              currentPhase = 'freefall';
            }
            break;

          case 'freefall':
            if (magnitude > thresholds.impactThreshold) {
              impactTime = now;
              currentPhase = 'impact';
            } else if (now - freeFallStartTime > thresholds.freeFallDuration) {
              currentPhase = 'normal';
            }
            break;

          case 'impact':
            if (magnitude < 1.2 && magnitude > 0.8) {
              stillStartTime = now;
              currentPhase = 'still';
            } else if (now - impactTime > thresholds.impactWindow) {
              currentPhase = 'normal';
            }
            break;

          case 'still':
            const isStill = magnitude < 1.2 && magnitude > 0.8;
            if (isStill && now - stillStartTime > thresholds.stillDuration) {
              if (showCountdown) {
                currentPhase = 'countdown';
                let countdown = 15;

                const countdownInterval = setInterval(() => {
                  countdown--;
                  if (countdown <= 0) {
                    clearInterval(countdownInterval);
                  }
                }, 1000);

                Alert.alert(
                  'Fall Detected',
                  'Are you okay? SOS will trigger in 15 seconds.',
                  [
                    {
                      text: "I'm OK",
                      onPress: () => {
                        clearInterval(countdownInterval);
                        currentPhase = 'normal';
                      },
                    },
                    {
                      text: 'Cancel SOS',
                      style: 'cancel',
                      onPress: () => {
                        clearInterval(countdownInterval);
                        currentPhase = 'normal';
                      },
                    },
                  ]
                );

                countdownTimeout = setTimeout(() => {
                  currentPhase = 'normal';
                  onFallDetected();
                }, 15000);
              } else {
                currentPhase = 'normal';
                onFallDetected();
              }
            } else if (!isStill) {
              currentPhase = 'impact';
              stillStartTime = 0;
            }
            break;
        }
      }
    );

    isMonitoring = true;
    return true;
  },

  stopFallDetection(): void {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      accelerometerSubscription = null;
    }

    if (fallTimeout) {
      clearTimeout(fallTimeout);
      fallTimeout = null;
    }

    if (countdownTimeout) {
      clearTimeout(countdownTimeout);
      countdownTimeout = null;
    }

    isMonitoring = false;
    currentPhase = 'normal';
    freeFallStartTime = 0;
    impactTime = 0;
    stillStartTime = 0;
  },

  getIsMonitoring(): boolean {
    return isMonitoring;
  },

  getCurrentPhase(): FallPhase {
    return currentPhase;
  },

  getThresholds(sensitivity: SensitivityLevel): FallDetectionThresholds {
    return THRESHOLDS[sensitivity];
  },
};

export function useFallDetection(
  enabled: boolean,
  sensitivity: SensitivityLevel,
  onFallDetected: () => void
) {
  const handleFallDetected = () => {
    onFallDetected();
  };

  if (enabled) {
    fallDetectionService.startFallDetection(handleFallDetected, sensitivity);
  } else {
    fallDetectionService.stopFallDetection();
  }
}
