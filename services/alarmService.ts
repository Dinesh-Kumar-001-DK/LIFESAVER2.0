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
        try {
          await alarmSound.unloadAsync();
        } catch (e) {
          // Ignore
        }
        alarmSound = null;
      }

      try {
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
            console.warn('Audio playback status:', status.error);
          }
        });

        await sound.playAsync();
      } catch (audioError) {
        console.warn('Could not load alarm sound:', audioError);
      }
    } catch (error) {
      console.warn('Error playing alarm:', error);
    }
  },

  async stopAlarm(): Promise<void> {
    try {
      if (alarmSound) {
        try {
          await alarmSound.stopAsync();
          await alarmSound.unloadAsync();
        } catch (e) {
          // Ignore
        }
        alarmSound = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.warn('Error stopping alarm:', error);
    }
  },

  async isAlarmPlaying(): Promise<boolean> {
    if (!alarmSound) return false;
    try {
      const status = await alarmSound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
    } catch {
      return false;
    }
  },
};
