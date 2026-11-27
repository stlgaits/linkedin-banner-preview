/**
 * Display presets, in CSS px.
 *
 * These come from third-party published measurements (Nov. 2026): LinkedIn does
 * NOT publish these values. Their source and reliability are described in the
 * `note.<preset key>` strings of each locale.
 *
 * Recommended image sizes (official LinkedIn): page 1512×256, profile 1584×396.
 *
 * Preset keys (`profil-*`) are part of the public URL API (`?mode=`): keep them stable.
 */

/** Company page or personal profile. */
export type BannerKind = 'page' | 'profil';

export interface Preset {
  kind: BannerKind;
  /** Usable banner width. */
  width: number;
  /** Banner height. */
  bannerHeight: number;
  /** Avatar (or logo) size, frame included. */
  avatarSize: number;
  /** Avatar distance from the left edge. */
  left: number;
  /** How far the avatar overlaps the banner. */
  overlap: number;
  /** Safety margin around the avatar. */
  margin: number;
  /** Round avatar (profile) or rounded square (company logo). */
  round: boolean;
  /** Corner radius for non-round avatars. */
  cornerRadius: number;
  /** Render inside a phone-like frame. */
  mobile: boolean;
}

export const PRESETS = {
  'page-desktop': {
    kind: 'page',
    width: 782,
    bannerHeight: 134,
    avatarSize: 128,
    left: 24,
    overlap: 63,
    margin: 12,
    round: false,
    cornerRadius: 6,
    mobile: false,
  },
  'page-mobile': {
    kind: 'page',
    width: 428,
    bannerHeight: 73.3,
    avatarSize: 99,
    left: 13,
    overlap: 34,
    margin: 8,
    round: false,
    cornerRadius: 14,
    mobile: true,
  },
  'profil-desktop': {
    kind: 'profil',
    width: 782,
    bannerHeight: 195.5,
    avatarSize: 128,
    left: 32,
    overlap: 68,
    margin: 12,
    round: true,
    cornerRadius: 6,
    mobile: false,
  },
  'profil-mobile': {
    kind: 'profil',
    width: 428,
    bannerHeight: 107,
    avatarSize: 128,
    left: 24,
    overlap: 76,
    margin: 8,
    round: true,
    cornerRadius: 6,
    mobile: true,
  },
} as const satisfies Record<string, Preset>;

export type ModeKey = keyof typeof PRESETS;

export const DEFAULT_MODE: ModeKey = 'page-desktop';

export const isModeKey = (key: unknown): key is ModeKey =>
  typeof key === 'string' && Object.hasOwn(PRESETS, key);

/** Recommended image sizes, per banner kind. */
export const RECOMMENDED_SIZE: Readonly<Record<BannerKind, { width: number; height: number }>> = {
  page: { width: 1512, height: 256 },
  profil: { width: 1584, height: 396 },
};

/** Tolerance on the aspect-ratio comparison between the image and the displayed banner. */
export const ASPECT_TOLERANCE = 0.03;
