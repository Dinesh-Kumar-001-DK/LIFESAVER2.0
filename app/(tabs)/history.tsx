import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';

export default function HistoryScreen() {
  const router = useRouter();
  const { alertHistory, clearAlertHistory } = useAppStore();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const alertDate = new Date(date);
    
    const isToday = alertDate.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = alertDate.toDateString() === yesterday.toDateString();

    const timeStr = alertDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `Today ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday ${timeStr}`;
    } else {
      return alertDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all alert history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearAlertHistory,
        },
      ]
    );
  };

  const handleOpenLocation = (location: string) => {
    if (location && location.startsWith('http')) {
      Linking.openURL(location);
    }
  };

  const getTriggerIcon = (triggerType: string): string => {
    switch (triggerType) {
      case 'Button':
        return 'hand-left';
      case 'Shake':
        return 'phone-portrait';
      case 'Volume':
        return 'volume-high';
      case 'Voice':
        return 'mic';
      case 'Fall':
        return 'body';
      default:
        return 'warning';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert History</Text>
        <View style={{ width: 24 }} />
      </View>

      {alertHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark" size={80} color="#3A3A3C" />
          <Text style={styles.emptyTitle}>No alerts yet</Text>
          <Text style={styles.emptySubtitle}>Stay safe!</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {alertHistory.map((alert, index) => (
              <View key={alert.id || index} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={styles.alertDateContainer}>
                    <Text style={styles.alertDate}>{formatDate(alert.timestamp)}</Text>
                    <View style={styles.triggerBadge}>
                      <Ionicons
                        name={getTriggerIcon(alert.triggerType) as any}
                        size={14}
                        color="#FF3B30"
                      />
                      <Text style={styles.triggerText}>{alert.triggerType}</Text>
                    </View>
                  </View>
                  <Text style={styles.alertDuration}>{alert.duration}s</Text>
                </View>

                {alert.location && (
                  <TouchableOpacity
                    style={styles.locationRow}
                    onPress={() => handleOpenLocation(alert.location!)}
                  >
                    <Ionicons name="location" size={18} color="#007AFF" />
                    <Text style={styles.locationText}>Open in Maps</Text>
                    <Ionicons name="open-outline" size={16} color="#007AFF" />
                  </TouchableOpacity>
                )}

                {alert.contactsNotified.length > 0 && (
                  <View style={styles.contactsRow}>
                    <Text style={styles.contactsLabel}>Notified:</Text>
                    <View style={styles.contactPills}>
                      {alert.contactsNotified.map((contact, i) => (
                        <View key={i} style={styles.contactPill}>
                          <Text style={styles.contactPillText}>{contact}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.clearButtonText}>Clear History</Text>
            </TouchableOpacity>
          </View>
        </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  alertCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  triggerText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  alertDuration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
  },
  contactsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  contactsLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contactPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  contactPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contactPillText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
