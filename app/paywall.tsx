import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/appStore';

export default function PaywallScreen() {
  const router = useRouter();
  const { setProStatus } = useAppStore();

  const handlePurchase = () => {
    setProStatus(true, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    router.back();
  };

  const handleRestore = () => {
    console.log('Restore purchase');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#FF3B30" />
        </View>

        <Text style={styles.title}>TapSafe Pro</Text>
        <Text style={styles.subtitle}>Full protection for you and your loved ones</Text>

        <View style={styles.trialBadge}>
          <Ionicons name="gift" size={16} color="#FFFFFF" />
          <Text style={styles.trialText}>7-day free trial</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
            <Text style={styles.featureText}>SMS to 5 emergency contacts</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
            <Text style={styles.featureText}>Auto phone call during SOS</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
            <Text style={styles.featureText}>Voice trigger ("Help me")</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
            <Text style={styles.featureText}>Fall detection with countdown</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
            <Text style={styles.featureText}>Auto video recording</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
            <Text style={styles.featureText}>Unlimited emergency contacts</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹99</Text>
          <Text style={styles.pricePeriod}>/month</Text>
        </View>

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          After your free trial, you'll be charged ₹99/month. Cancel anytime.
          {'\n\n'}
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
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
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 32,
  },
  trialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 18,
    color: '#8E8E93',
    marginLeft: 4,
  },
  purchaseButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  disclaimer: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
