import { Camera, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

const MAX_RECORDING_DURATION = 5 * 60 * 1000;
const CLIP_DURATION = 60 * 1000;

let isRecording = false;
let recordingStartTime = 0;
let currentRecording: { stop: () => Promise<void> } | null = null;
let clipInterval: ReturnType<typeof setInterval> | null = null;

export const recordingService = {
  async startRecording(
    useFrontCamera: boolean = true,
    onError?: (error: string) => void
  ): Promise<boolean> {
    if (isRecording) return true;

    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();

      if (cameraPermission.status !== 'granted' || microphonePermission.status !== 'granted') {
        onError?.('Camera or microphone permission not granted');
        return false;
      }

      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaLibraryPermission.status !== 'granted') {
        onError?.('Media library permission not granted');
        return false;
      }

      isRecording = true;
      recordingStartTime = Date.now();

      clipInterval = setInterval(async () => {
        const elapsed = Date.now() - recordingStartTime;
        if (elapsed >= MAX_RECORDING_DURATION) {
          await recordingService.stopRecording();
        }
      }, CLIP_DURATION);

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      isRecording = false;
      onError?.(error instanceof Error ? error.message : 'Failed to start recording');
      return false;
    }
  },

  async stopRecording(onComplete?: (assetId: string | null) => void): Promise<void> {
    if (!isRecording) return;

    try {
      if (clipInterval) {
        clearInterval(clipInterval);
        clipInterval = null;
      }

      if (currentRecording) {
        await currentRecording.stop();
        currentRecording = null;
      }

      isRecording = false;
      recordingStartTime = 0;

      onComplete?.(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      isRecording = false;
    }
  },

  async saveToMediaLibrary(
    uri: string,
    filename: string = `TapSafe_${Date.now()}.mp4`
  ): Promise<string | null> {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      const album = await MediaLibrary.getAlbumAsync('TapSafe');
      
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('TapSafe', asset, false);
      }

      return asset.id;
    } catch (error) {
      console.error('Error saving to media library:', error);
      return null;
    }
  },

  async getStorageUsage(): Promise<{ count: number; size: number }> {
    try {
      const album = await MediaLibrary.getAlbumAsync('TapSafe');
      
      if (!album) {
        return { count: 0, size: 0 };
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: 'video',
      });

      let totalSize = 0;
      for (const asset of assets) {
        totalSize += asset.uri.length;
      }

      return {
        count: assets.length,
        size: totalSize,
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { count: 0, size: 0 };
    }
  },

  async clearRecordings(): Promise<boolean> {
    try {
      const album = await MediaLibrary.getAlbumAsync('TapSafe');
      
      if (!album) return true;

      const { assets } = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: 'video',
      });

      for (const asset of assets) {
        await MediaLibrary.deleteAssetsAsync([asset]);
      }

      return true;
    } catch (error) {
      console.error('Error clearing recordings:', error);
      return false;
    }
  },

  getIsRecording(): boolean {
    return isRecording;
  },

  getRecordingDuration(): number {
    if (!isRecording) return 0;
    return Date.now() - recordingStartTime;
  },

  getMaxDuration(): number {
    return MAX_RECORDING_DURATION;
  },
};
