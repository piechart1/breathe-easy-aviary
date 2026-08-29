import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo } from 'react-native-purchases';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

// The entitlement identifier configured in the RevenueCat dashboard for
// paid features (advanced patterns, Voice cues, reminders, etc. - exact
// boundaries not yet decided).
export const PRO_ENTITLEMENT_ID = 'pro';

let initialized = false;

function hasProEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[PRO_ENTITLEMENT_ID] != null;
}

// Configures the RevenueCat SDK once per app launch. Safe to call even
// without API keys set (e.g. before the RevenueCat project/products are
// set up) - it just no-ops, so getIsPro() always resolves false and no
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

export async function getIsPro(): Promise<boolean> {
  if (!initialized) {
    return false;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return hasProEntitlement(info);
  } catch (error) {
    console.log('[purchases] getCustomerInfo ERROR', error);
    return false;
  }
}

// Resolves the up-to-date Pro status; throws on failure so a paywall
// screen can distinguish "restore found nothing" from "restore failed".
export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return hasProEntitlement(info);
}

// Reactive Pro-entitlement check for gating UI - starts as `null` (unknown)
// until the first CustomerInfo resolves, so callers can distinguish
// "still loading" from "confirmed not Pro" and avoid a flash of gated UI.
export function useIsPro(): boolean | null {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    if (!initialized) {
      setIsPro(false);
      return;
    }

    let cancelled = false;
    getIsPro().then((value) => {
      if (!cancelled) {
        setIsPro(value);
      }
    });

    const listener = (info: CustomerInfo) => {
      if (!cancelled) {
        setIsPro(hasProEntitlement(info));
      }
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      cancelled = true;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  return isPro;
}
