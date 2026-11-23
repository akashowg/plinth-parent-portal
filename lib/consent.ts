export const CONSENT_VERSION = "parent-consent-v2-2026-11-23";
export const CONSENT_ITEMS = ["c_guardian", "c_purpose", "c_ai", "c_nature", "c_safeguard", "c_withdraw"] as const;
export type FormState = { error?: string; devCode?: string; done?: boolean; message?: string };
