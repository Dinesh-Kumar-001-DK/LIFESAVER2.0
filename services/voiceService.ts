import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

const KEYWORDS = [
  'help me',
  'help',
  'emergency',
  'bachao',
  'madad',
  'save me',
  'save me now',
  'help me please',
];

const DETECTION_TIMEOUT = 3000;
const REQUIRED_DETECTIONS = 2;

let isListening = false;
let keywordDetectionCount = 0;
let lastKeywordTime = 0;
let onKeywordCallback: (() => void) | null = null;

export const voiceService = {
  async startVoiceListener(
    onKeywordDetected: () => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    if (isListening) return true;

    try {
      const permissions = await import('../services/permissionService');
      const micGranted = await permissions.permissionService.requestMicrophonePermission();
      
      if (!micGranted) {
        onError?.('Microphone permission not granted');
        return false;
      }

      onKeywordCallback = onKeywordDetected;

      Voice.onSpeechResults = (event: SpeechResultsEvent) => {
        if (!event.value || event.value.length === 0) return;

        const transcript = event.value[0].toLowerCase();
        
        const matchedKeyword = KEYWORDS.some((keyword) =>
          transcript.includes(keyword)
        );

        if (matchedKeyword) {
          const now = Date.now();
          
          if (now - lastKeywordTime > DETECTION_TIMEOUT) {
            keywordDetectionCount = 0;
          }
          
          keywordDetectionCount++;
          lastKeywordTime = now;

          if (keywordDetectionCount >= REQUIRED_DETECTIONS) {
            keywordDetectionCount = 0;
            onKeywordCallback?.();
          }
        }
      };

      Voice.onSpeechError = (event: SpeechErrorEvent) => {
        console.error('Voice recognition error:', event.error);
        onError?.(String(event.error) || 'Unknown error');
      };

      await Voice.start('en-US');
      isListening = true;
      
      return true;
    } catch (error) {
      console.error('Error starting voice listener:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to start voice listener');
      return false;
    }
  },

  async stopVoiceListener(): Promise<void> {
    if (!isListening) return;

    try {
      await Voice.destroy();
      isListening = false;
      keywordDetectionCount = 0;
      onKeywordCallback = null;
    } catch (error) {
      console.error('Error stopping voice listener:', error);
    }
  },

  getIsListening(): boolean {
    return isListening;
  },

  getKeywords(): string[] {
    return KEYWORDS;
  },
};
