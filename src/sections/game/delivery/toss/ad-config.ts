"use client";

/**
 * Centralized Toss Ads Configuration & Group IDs
 */
export const TOSS_AD_GROUP_IDS = {
  BANNER: process.env.NEXT_PUBLIC_TOSS_BANNER_AD_GROUP_ID,
  BIG_BANNER: process.env.NEXT_PUBLIC_TOSS_BIG_BANNER_AD_GROUP_ID,
  INTERSTITIAL: process.env.NEXT_PUBLIC_TOSS_INTERSTITIAL_AD_GROUP_ID,
  REWARD: process.env.NEXT_PUBLIC_TOSS_REWARD_AD_GROUP_ID,
} as const;

export type AdType = keyof typeof TOSS_AD_GROUP_IDS;

export function getAdGroupId(type: AdType, overrideId?: string): string {
  if (overrideId && overrideId.trim() !== "") {
    return overrideId;
  }
  return TOSS_AD_GROUP_IDS[type] || "";
}
