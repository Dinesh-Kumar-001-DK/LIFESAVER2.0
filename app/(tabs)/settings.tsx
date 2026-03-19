import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { ContactCard } from '../../components/ContactCard';
import { permissionService } from '../../services/permissionService';
import { triggerService } from '../../services/triggerService';
import { smsService } from '../../services/smsService';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    updateSettings,
    emergencyContacts,
    addContact,
    removeContact,
    isPro,
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    if (emergencyContacts.length >= (isPro ? 10 : 1)) {
      Alert.alert(
        'Contact Limit',
        isPro
          ? 'Maximum 10 contacts allowed for Pro users'
          : 'Upgrade to Pro to add more contacts',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }

    addContact({
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
    });

    setNewName('');
    setNewPhone('');
    setModalVisible(false);
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeContact(id) },
      ]
    );
  };

  const handleTestSOS = async () => {
    Alert.alert('Test Mode', 'Testing alarm for 3 seconds...', [
      { text: 'OK' },
    ]);

    useAppStore.getState().setAlarmActive(true);
    await triggerService.triggerSOS('Button');
    
    setTimeout(async () => {
      await triggerService.stopSOS();
    }, 3000);
  };

  const handleTestSMS = async () => {
    const contacts = emergencyContacts.map(c => c.phone);
    const result = await smsService.sendTestSMS(contacts);
    
    if (result.success) {
      Alert.alert('Success', 'Test SMS sent successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to send test SMS');
    }
  };

  const maxContacts = isPro ? 10 : 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!isPro && (
          <TouchableOpacity
            style={styles.proBanner}
            onPress={() => router.push('/paywall')}
          >
            <View style={styles.proBannerContent}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <View style={styles.proBannerText}>
                <Text style={styles.proBannerTitle}>Upgrade to TapSafe Pro</Text>
                <Text style={styles.proBannerSubtitle}>Unlock all features</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSubtitle}>
            {emergencyContacts.length}/{maxContacts} contacts
          </Text>
          
          {emergencyContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              name={contact.name}
              phone={contact.phone}
              onDelete={() => handleDeleteContact(contact.id)}
            />
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FF3B30" />
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trigger Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Volume Button Trigger</Text>
            </View>
            <Switch
              value={settings.volumeTriggerEnabled}
              onValueChange={(value) => updateSettings({ volumeTriggerEnabled: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-landscape" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Shake Trigger</Text>
            </View>
            <Switch
              value={settings.shakeTriggerEnabled}
              onValueChange={(value) => updateSettings({ shakeTriggerEnabled: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="flash" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Flashlight SOS</Text>
            </View>
            <Switch
              value={settings.flashEnabled}
              onValueChange={(value) => updateSettings({ flashEnabled: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>SMS Alerts</Text>
            </View>
            <Switch
              value={settings.smsEnabled}
              onValueChange={(value) => updateSettings({ smsEnabled: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="call" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Auto Phone Call</Text>
              {!isPro && (
                <Ionicons name="lock-closed" size={14} color="#FFD700" />
              )}
            </View>
            <Switch
              value={settings.callEnabled}
              onValueChange={(value) => {
                if (!isPro) {
                  router.push('/paywall');
                  return;
                }
                updateSettings({ callEnabled: value });
              }}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
              disabled={!isPro}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="hand-left" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Vibration</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Mode Settings</Text>
          <Text style={styles.sectionSubtitle}>
            Configure which actions are disabled during testing
          </Text>

          <View style={[styles.settingRow, settings.testAlarm && styles.testModeRowActive]}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high" size={22} color="#FF3B30" />
              <Text style={styles.settingLabel}>Alarm Sound</Text>
            </View>
            <Switch
              value={settings.testAlarm}
              onValueChange={(value) => updateSettings({ testAlarm: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, settings.testSMS && styles.testModeRowActive]}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble" size={22} color="#007AFF" />
              <Text style={styles.settingLabel}>SMS Alerts</Text>
            </View>
            <Switch
              value={settings.testSMS}
              onValueChange={(value) => updateSettings({ testSMS: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, settings.testCalls && styles.testModeRowActive]}>
            <View style={styles.settingInfo}>
              <Ionicons name="call" size={22} color="#34C759" />
              <Text style={styles.settingLabel}>Auto Phone Call</Text>
            </View>
            <Switch
              value={settings.testCalls}
              onValueChange={(value) => updateSettings({ testCalls: value })}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, settings.testMode && styles.testModeRow]}>
            <View style={styles.settingInfo}>
              <Ionicons name="bug" size={22} color="#FF9500" />
              <View>
                <Text style={styles.settingLabel}>Enable Test Mode</Text>
                <Text style={styles.settingSubLabel}>Disables selected actions above</Text>
              </View>
            </View>
            <Switch
              value={settings.testMode}
              onValueChange={(value) => {
                updateSettings({ testMode: value });
                if (value) {
                  Alert.alert(
                    'Test Mode Enabled',
                    'Selected actions above will be disabled. Turn off to enable all features.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              trackColor={{ false: '#3A3A3C', true: '#FF9500' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Features</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mic" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Voice Trigger</Text>
              {!isPro && (
                <Ionicons name="lock-closed" size={14} color="#FFD700" />
              )}
            </View>
            <Switch
              value={settings.voiceTriggerEnabled}
              onValueChange={(value) => {
                if (!isPro) {
                  router.push('/paywall');
                  return;
                }
                updateSettings({ voiceTriggerEnabled: value });
              }}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
              disabled={!isPro}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="body" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Fall Detection</Text>
              {!isPro && (
                <Ionicons name="lock-closed" size={14} color="#FFD700" />
              )}
            </View>
            <Switch
              value={settings.fallDetectionEnabled}
              onValueChange={(value) => {
                if (!isPro) {
                  router.push('/paywall');
                  return;
                }
                updateSettings({ fallDetectionEnabled: value });
              }}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
              disabled={!isPro}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="videocam" size={22} color="#8E8E93" />
              <Text style={styles.settingLabel}>Auto Record on SOS</Text>
              {!isPro && (
                <Ionicons name="lock-closed" size={14} color="#FFD700" />
              )}
            </View>
            <Switch
              value={settings.autoRecordEnabled}
              onValueChange={(value) => {
                if (!isPro) {
                  router.push('/paywall');
                  return;
                }
                updateSettings({ autoRecordEnabled: value });
              }}
              trackColor={{ false: '#3A3A3C', true: '#4CD964' }}
              thumbColor="#FFFFFF"
              disabled={!isPro}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test SOS</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestSOS}>
            <Ionicons name="bug" size={22} color="#FF9500" />
            <Text style={styles.testButtonText}>Test Alarm (3 seconds)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={handleTestSMS}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#007AFF" />
            <Text style={styles.testButtonText}>Send Test SMS</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Emergency Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#8E8E93"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#8E8E93"
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleAddContact}>
              <Text style={styles.modalButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBannerText: {},
  proBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  proBannerSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingSubLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  testModeRow: {
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  testModeRowActive: {
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
