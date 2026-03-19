import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SOSButton } from '../../components/SOSButton';
import { useAppStore } from '../../store/appStore';
import { triggerService } from '../../services/triggerService';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const isAlarmActive = useAppStore((state) => state.isAlarmActive);
  const settings = useAppStore((state) => state.settings);
  const shakeTriggerEnabled = settings.shakeTriggerEnabled;
  const router = useRouter();

  useEffect(() => {
    if (shakeTriggerEnabled) {
      triggerService.startTriggerListeners(() => {
        triggerService.triggerSOS('Shake');
      });
    } else {
      triggerService.stopTriggerListeners();
    }

    return () => {
      triggerService.stopTriggerListeners();
    };
  }, [shakeTriggerEnabled]);

  const handleSOSPress = async () => {
    if (isAlarmActive) {
      await triggerService.stopSOS();
    } else {
      await triggerService.triggerSOS('Button');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.logo}>TapSafe</Text>
        <Text style={styles.tagline}>Help in 3 Clicks</Text>
        {settings.testMode && (
          <View style={styles.testModeBadge}>
            <Ionicons name="bug" size={14} color="#FF9500" />
            <Text style={styles.testModeText}>TEST MODE</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <SOSButton
            isActive={isAlarmActive}
            onPress={handleSOSPress}
            size={200}
          />
          
          {!isAlarmActive && (
            <Text style={styles.hint}>Tap SOS button or shake phone ×3</Text>
          )}
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons
              name={shakeTriggerEnabled ? 'phone-portrait' : 'phone-portrait-outline'}
              size={20}
              color={shakeTriggerEnabled ? '#4CD964' : '#8E8E93'}
            />
            <Text style={styles.statusText}>Shake</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons
              name={settings.volumeTriggerEnabled ? 'volume-high' : 'volume-mute'}
              size={20}
              color={settings.volumeTriggerEnabled ? '#4CD964' : '#8E8E93'}
            />
            <Text style={styles.statusText}>Volume ×3</Text>
          </View>
          
          {settings.voiceTriggerEnabled && (
            <View style={styles.statusItem}>
              <Ionicons name="mic" size={20} color="#4CD964" />
              <Text style={styles.statusText}>Voice</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <View style={styles.navPill}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            <Text style={styles.navText}>Settings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/history')}
        >
          <View style={styles.navPill}>
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            <Text style={styles.navText}>History</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isAlarmActive && (
        <View style={styles.activeBorder} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  testModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  testModeText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  hint: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 24,
  },
  statusItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  navButton: {
    flex: 1,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: '#FF3B30',
    pointerEvents: 'none',
  },
});
