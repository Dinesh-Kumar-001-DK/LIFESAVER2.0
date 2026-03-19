import { Audio, AVPlaybackStatus } from 'expo-av';

let alarmSound: Audio.Sound | null = null;

export const alarmService = {
  async playAlarm(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (alarmSound) {
        await alarmSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3'),
        {
          isLooping: true,
          volume: 1.0,
          shouldPlay: true,
        }
      );

      alarmSound = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          console.error('Audio playback error:', status.error);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Error playing alarm:', error);
      throw error;
    }
  },

  async stopAlarm(): Promise<void> {
    try {
      if (alarmSound) {
        await alarmSound.stopAsync();
        await alarmSound.unloadAsync();
        alarmSound = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Error stopping alarm:', error);
      throw error;
    }
  },

  async isAlarmPlaying(): Promise<boolean> {
    if (!alarmSound) return false;
    const status = await alarmSound.getStatusAsync();
    return status.isLoaded && status.isPlaying;
  },
};
