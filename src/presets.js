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

/**
 * @typedef {'page' | 'profil'} BannerKind
 *
 * @typedef {object} Preset
 * @property {BannerKind} kind Company page or personal profile.
 * @property {number} width Usable banner width.
 * @property {number} bannerHeight Banner height.
 * @property {number} avatarSize Avatar (or logo) size, frame included.
 * @property {number} left Avatar distance from the left edge.
 * @property {number} overlap How far the avatar overlaps the banner.
 * @property {number} margin Safety margin around the avatar.
 * @property {boolean} round Round avatar (profile) or rounded square (company logo).
 * @property {number} cornerRadius Corner radius for non-round avatars.
 * @property {boolean} mobile Render inside a phone-like frame.
 */

/** @type {Readonly<Record<string, Preset>>} */
export const PRESETS = Object.freeze({
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
});

export const DEFAULT_MODE = 'page-desktop';

/** Recommended image sizes, per banner kind. */
export const RECOMMENDED_SIZE = Object.freeze({
  page: { width: 1512, height: 256 },
  profil: { width: 1584, height: 396 },
});

/** Tolerance on the aspect-ratio comparison between the image and the displayed banner. */
export const ASPECT_TOLERANCE = 0.03;
