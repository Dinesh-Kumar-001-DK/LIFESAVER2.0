import * as Location from 'expo-location';

export const locationService = {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        return false;
      }

      try {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        return backgroundStatus === 'granted';
      } catch {
        return true;
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  },

  async getCurrentLocationLink(): Promise<string> {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      
      if (!hasPermission) {
        return 'Location unavailable';
      }

      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const timeoutPromise = new Promise<Location.LocationObject | null>((resolve) => {
        setTimeout(() => resolve(null), 10000);
      });

      let location = await Promise.race([locationPromise, timeoutPromise]);

      if (!location) {
        const lastLocation = await Location.getLastKnownPositionAsync();
        location = lastLocation;
      }

      if (!location) {
        return 'Location unavailable';
      }

      const { latitude, longitude } = location.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      
      return mapsLink;
    } catch (error) {
      console.error('Error getting current location:', error);
      return 'Location unavailable';
    }
  },

  async getCurrentPosition(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return location;
    } catch (error) {
      console.error('Error getting current position:', error);
      return null;
    }
  },
};
