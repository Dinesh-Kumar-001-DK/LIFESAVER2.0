import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export const permissionService = {
  async requestAllPermissions(): Promise<boolean> {
    try {
      const [
        locationResult,
        cameraResult,
        microphoneResult,
        contactsResult,
      ] = await Promise.all([
        Location.requestForegroundPermissionsAsync(),
        Camera.requestCameraPermissionsAsync(),
        Camera.requestMicrophonePermissionsAsync(),
        Contacts.requestPermissionsAsync(),
      ]);

      const locationGranted = locationResult.status === 'granted';
      const cameraGranted = cameraResult.status === 'granted';
      const microphoneGranted = microphoneResult.status === 'granted';
      const contactsGranted = contactsResult.status === 'granted';

      console.log('Permission results:', {
        location: locationGranted,
        camera: cameraGranted,
        microphone: microphoneGranted,
        contacts: contactsGranted,
      });

      return locationGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  },

  async checkPermissions(): Promise<{
    location: boolean;
    camera: boolean;
    microphone: boolean;
    contacts: boolean;
  }> {
    try {
      const [
        locationResult,
        cameraResult,
        microphoneResult,
        contactsResult,
      ] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Camera.getCameraPermissionsAsync(),
        Camera.getMicrophonePermissionsAsync(),
        Contacts.getPermissionsAsync(),
      ]);

      return {
        location: locationResult.status === 'granted',
        camera: cameraResult.status === 'granted',
        microphone: microphoneResult.status === 'granted',
        contacts: contactsResult.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        location: false,
        camera: false,
        microphone: false,
        contacts: false,
      };
    }
  },

  async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async requestCameraPermission(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  },

  async requestMicrophonePermission(): Promise<boolean> {
    const { status } = await Camera.requestMicrophonePermissionsAsync();
    return status === 'granted';
  },

  async requestContactsPermission(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  },
};
