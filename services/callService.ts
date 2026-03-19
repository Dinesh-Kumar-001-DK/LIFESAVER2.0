import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

let countdownTimer: ReturnType<typeof setTimeout> | null = null;

export const callService = {
  async callEmergencyContact(phone: string): Promise<void> {
    try {
      const phoneNumber = phone.replace(/[^0-9]/g, '');
      const telUri = `tel:${phoneNumber}`;
      
      const canOpen = await Linking.canOpenURL(telUri);
      
      if (canOpen) {
        await Linking.openURL(telUri);
      } else {
        throw new Error('Phone calls not supported on this device');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      throw error;
    }
  },

  async autoCallWithDelay(
    contacts: string[],
    delayMs: number = 5000,
    onCountdown?: (seconds: number) => void,
    onCancel?: () => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let remainingSeconds = Math.ceil(delayMs / 1000);
      
      const showCountdown = () => {
        if (remainingSeconds > 0) {
          onCountdown?.(remainingSeconds);
          remainingSeconds--;
          countdownTimer = setTimeout(showCountdown, 1000);
        }
      };

      Alert.alert(
        'Calling Emergency Contact',
        `Calling in ${remainingSeconds} seconds...`,
        [
          {
            text: 'Cancel Call',
            style: 'cancel',
            onPress: () => {
              if (countdownTimer) {
                clearTimeout(countdownTimer);
                countdownTimer = null;
              }
              onCancel?.();
              resolve(false);
            },
          },
        ],
        { cancelable: false }
      );

      showCountdown();

      countdownTimer = setTimeout(async () => {
        countdownTimer = null;
        
        if (contacts.length > 0) {
          await callService.callEmergencyContact(contacts[0]);
        } else {
          await callService.callEmergencyContact('112');
        }
        
        resolve(true);
      }, delayMs);
    });
  },

  cancelAutoCall(): void {
    if (countdownTimer) {
      clearTimeout(countdownTimer);
      countdownTimer = null;
    }
  },
};
