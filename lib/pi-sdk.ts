/**
 * PiForge – Official Pi SDK Integration Layer
 * Designed for Pi Browser. Falls back gracefully outside Browser for development.
 */

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void
      ) => Promise<PiAuthResult>;
      createPayment: (
        paymentData: PiPaymentData,
        callbacks: PiPaymentCallbacks
      ) => void;
      openShareDialog?: (title: string, message: string) => void;
      nativeFeaturesList?: () => Promise<string[]>;
    };
  }
}

export interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

let isInitialized = false;

export function initPiSDK(sandbox = false): void {
  if (typeof window === "undefined") return;
  if (!window.Pi) {
    console.warn("[PiForge] Pi SDK not detected. Running in development mode.");
    return;
  }
  if (isInitialized) return;

  window.Pi.init({ version: "2.0", sandbox });
  isInitialized = true;
  console.log("[PiForge] Pi SDK initialized");
}

export async function authenticatePioneer(
  onIncompletePaymentFound?: (payment: any) => void
): Promise<PiAuthResult | null> {
  if (typeof window === "undefined" || !window.Pi) {
    // Dev fallback – never use in production
    return {
      accessToken: "dev-token-" + Date.now(),
      user: { uid: "dev-uid-001", username: "DevPioneer" },
    };
  }

  try {
    const result = await window.Pi.authenticate(
      ["username", "payments", "wallet_address"],
      onIncompletePaymentFound
    );
    return result;
  } catch (err) {
    console.error("[PiForge] Auth failed:", err);
    return null;
  }
}

export function createPiPayment(
  data: PiPaymentData,
  callbacks: PiPaymentCallbacks
): void {
  if (typeof window === "undefined" || !window.Pi) {
    console.warn("[PiForge] Payment simulated in development");
    // Simulate success path for local testing
    setTimeout(() => {
      callbacks.onReadyForServerApproval("dev-payment-" + Date.now());
      setTimeout(() => {
        callbacks.onReadyForServerCompletion(
          "dev-payment-" + Date.now(),
          "dev-txid-" + Date.now()
        );
      }, 800);
    }, 500);
    return;
  }

  window.Pi.createPayment(data, callbacks);
}

export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.Pi;
}
