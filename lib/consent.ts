export const CONSENT_VERSION = "parent-consent-v1-2026-11-23";
export const CONSENT_ITEMS = ["c_guardian", "c_purpose", "c_ai", "c_nature", "c_withdraw"] as const;
export type FormState = { error?: string; devCode?: string; done?: boolean; message?: string };
