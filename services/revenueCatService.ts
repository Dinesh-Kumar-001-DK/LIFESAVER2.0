import Purchases, { CustomerInfo, PurchasesConfiguration } from 'react-native-purchases';
import { useAppStore } from '../store/appStore';

const REVENUECAT_API_KEY = __DEV__
  ? 'REVENUECAT_DEV_API_KEY'
  : 'REVENUECAT_PROD_API_KEY';

const PRO_MONTHLY_PRODUCT_ID = 'com.tapsafe.app.pro.monthly';

let isInitialized = false;

export const revenueCatService = {
  async initialize(): Promise<void> {
    if (isInitialized) return;

    try {
      const config: PurchasesConfiguration = {
        apiKey: REVENUECAT_API_KEY,
        appUserID: null,
      };

      await Purchases.configure(config);
      isInitialized = true;

      await revenueCatService.checkSubscriptionStatus();
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  },

  async checkSubscriptionStatus(): Promise<void> {
    if (!isInitialized) return;

    try {
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();

      const subscription = customerInfo.entitlements.active[PRO_MONTHLY_PRODUCT_ID];

      if (subscription) {
        const expiryDate = subscription.expirationDate
          ? new Date(subscription.expirationDate)
          : null;

        useAppStore.getState().setProStatus(true, expiryDate || undefined);
      } else {
        useAppStore.getState().setProStatus(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  },

  async purchasePro(): Promise<boolean> {
    if (!isInitialized) {
      await revenueCatService.initialize();
    }

    try {
      const products = await Purchases.getProducts([PRO_MONTHLY_PRODUCT_ID]);

      if (products.length === 0) {
        throw new Error('Pro product not found');
      }

      const purchaseResult = await Purchases.purchaseStoreProduct(products[0]);

      if (purchaseResult && purchaseResult.transaction) {
        await revenueCatService.checkSubscriptionStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error purchasing Pro:', error);
      return false;
    }
  },

  async restorePurchases(): Promise<boolean> {
    if (!isInitialized) {
      await revenueCatService.initialize();
    }

    try {
      await Purchases.restorePurchases();
      await revenueCatService.checkSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  },

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  isProFeatureLocked(feature: string): boolean {
    const state = useAppStore.getState();

    const proFeatures = [
      'voiceTrigger',
      'fallDetection',
      'autoRecord',
      'autoCall',
    ];

    if (!state.isPro && proFeatures.includes(feature)) {
      return true;
    }

    if (!state.isPro && feature === 'extraContacts' && state.emergencyContacts.length >= 1) {
      return true;
    }

    return false;
  },

  getIsInitialized(): boolean {
    return isInitialized;
  },
};
