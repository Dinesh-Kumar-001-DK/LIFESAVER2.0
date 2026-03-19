import * as SMS from 'expo-sms';
import { locationService } from './locationService';

export const smsService = {
  async isAvailable(): Promise<boolean> {
    const result = await SMS.isAvailableAsync();
    return Boolean(result);
  },

  async sendEmergencySMS(contacts: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const isSMSAvailable = await smsService.isAvailable();
      
      if (!isSMSAvailable) {
        return { success: false, error: 'SMS not available on this device' };
      }

      const locationLink = await locationService.getCurrentLocationLink();
      
      const message = `EMERGENCY ALERT! I need immediate help. My location: ${locationLink} - Sent via TapSafe app`;

      const phoneNumbers = contacts.length > 0 ? contacts : ['9047254434'];// Default to emergency number if no contacts

      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);

      return { success: result === 'sent' || result === 'unknown' };
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send SMS' 
      };
    }
  },

  async sendTestSMS(contacts: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const isSMSAvailable = await smsService.isAvailable();
      
      if (!isSMSAvailable) {
        return { success: false, error: 'SMS not available on this device' };
      }

      const locationLink = await locationService.getCurrentLocationLink();
      
      const message = `TapSafe TEST: This is a test message. My location: ${locationLink}`;

      const { result } = await SMS.sendSMSAsync(contacts, message);

      return { success: result === 'sent' || result === 'unknown' };
    } catch (error) {
      console.error('Error sending test SMS:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send SMS' 
      };
    }
  },
};
