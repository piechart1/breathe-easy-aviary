import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

// The entitlement identifier configured in the RevenueCat dashboard for
// Plus (advanced patterns, full backing-music rotation).
export const PLUS_ENTITLEMENT_ID = 'plus';

let initialized = false;

// Dev-only Plus override, used by a Settings toggle so gating (locked
// patterns, backing-music tier, paywall trigger) can be tested without a
// real purchase. `null` means "no override, use the real entitlement" -
// every reference to this is gated on `__DEV__`, so it's dead code in a
// release build and can never let a real user bypass paying.
const DEV_PLUS_OVERRIDE_KEY = 'breathe-easy:dev-plus-override';
let devPlusOverride: boolean | null = null;
let devOverrideLoaded = false;
const devOverrideListeners = new Set<(value: boolean | null) => void>();

async function loadDevPlusOverride(): Promise<boolean | null> {
  if (!devOverrideLoaded) {
    devOverrideLoaded = true;
    const raw = await AsyncStorage.getItem(DEV_PLUS_OVERRIDE_KEY);
    devPlusOverride = raw === null ? null : raw === 'true';
  }
  return devPlusOverride;
}

export async function setDevPlusOverride(value: boolean | null): Promise<void> {
  devPlusOverride = value;
  devOverrideListeners.forEach((listener) => listener(value));
  if (value === null) {
    await AsyncStorage.removeItem(DEV_PLUS_OVERRIDE_KEY);
  } else {
    await AsyncStorage.setItem(DEV_PLUS_OVERRIDE_KEY, String(value));
  }
}

function hasPlusEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[PLUS_ENTITLEMENT_ID] != null;
}

// Configures the RevenueCat SDK once per app launch. Safe to call even
// without API keys set (e.g. before the RevenueCat project/products are
// set up) - it just no-ops, so getIsPlus() always resolves false and no
// feature ends up gated on a purchases call that can't succeed.
export function initPurchases(): void {
  if (initialized) {
    return;
  }
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  if (!apiKey) {
    return;
  }
  Purchases.configure({ apiKey });
  initialized = true;
}

export async function getIsPlus(): Promise<boolean> {
  if (!initialized) {
    return false;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return hasPlusEntitlement(info);
  } catch (error) {
    console.log('[purchases] getCustomerInfo ERROR', error);
    return false;
  }
}

// Resolves the up-to-date Plus status; throws on failure so a paywall
// screen can distinguish "restore found nothing" from "restore failed".
export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return hasPlusEntitlement(info);
}

// Reactive Plus-entitlement check for gating UI - starts as `null` (unknown)
// until the first CustomerInfo resolves, so callers can distinguish
// "still loading" from "confirmed not Plus" and avoid a flash of gated UI.
export function useIsPlus(): boolean | null {
  const [isPlus, setIsPlus] = useState<boolean | null>(null);
  const [devOverride, setDevOverride] = useState<boolean | null>(devPlusOverride);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    let cancelled = false;
    loadDevPlusOverride().then((value) => {
      if (!cancelled) {
        setDevOverride(value);
      }
    });
    const listener = (value: boolean | null) => setDevOverride(value);
    devOverrideListeners.add(listener);
    return () => {
      cancelled = true;
      devOverrideListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!initialized) {
      setIsPlus(false);
      return;
    }

    let cancelled = false;
    getIsPlus().then((value) => {
      if (!cancelled) {
        setIsPlus(value);
      }
    });

    const listener = (info: CustomerInfo) => {
      if (!cancelled) {
        setIsPlus(hasPlusEntitlement(info));
      }
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      cancelled = true;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  if (__DEV__ && devOverride !== null) {
    return devOverride;
  }
  return isPlus;
}

// Single call site for every "Upgrade to Plus" trigger in the app - shows
// RevenueCat's dashboard-configured paywall (a no-op if the user is already
// entitled) and reports back whether they ended up with Plus access, so
// callers can e.g. immediately let a just-purchased action proceed.
export async function presentPlusPaywall(): Promise<boolean> {
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PLUS_ENTITLEMENT_ID,
    });
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  } catch (error) {
    // e.g. no native paywall module on this platform/build (web preview),
    // or no offering configured yet in the RevenueCat dashboard.
    console.log('[purchases] presentPaywallIfNeeded ERROR', error);
    return false;
  }
}
